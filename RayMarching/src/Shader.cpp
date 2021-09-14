#include "Shader.h"

std::string ReadFile(const std::string& path)
{
	// open file
	std::ifstream file(path);

	// check that it opened properly
	if (!file.is_open())
	{
		std::cout << "File " << path << " not opened" << std::endl;
		return "";
	}
	
	// store output in this variable
	std::string shader;
	
	// actually read file
	char c;
	while (file.get(c))
		shader += c;

	file.close();

	return shader;
}

std::string FindIncludeStatement(const std::string& file, size_t& start, size_t& end)
{
	const std::string include = "#include";
	start = file.find(include, start);
	end = file.find("\n", start + 1);

	std::string newFileName = file.substr(start + include.size() + 2, end - start - include.size() - 3);

	if (start == std::string::npos)
		return std::string();

	return newFileName;
}

std::string ParseShader(const std::string& file)
{
	std::string shader = ReadFile(file);

	// find all the include statements
	size_t lineStart = 0;
	size_t lineEnd = 0;
	std::string fileName;

	do
	{
		fileName = FindIncludeStatement(shader, lineStart, lineEnd);

		// replace include statement with file code
		if (fileName.size() > 0)
		{
			std::string str = ReadFile(fileName);
			shader.erase(lineStart, lineEnd - lineStart);
			shader.insert(lineStart, str);
		}
	} while (fileName.size() > 0);

	return shader;
}