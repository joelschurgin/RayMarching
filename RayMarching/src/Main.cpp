#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <iostream>
#include <filesystem>
#include <string>
#include <vector>
#include <math.h>

#include "Renderer.h"
#include "Shader.h"

namespace fs = std::filesystem;

#define PATH "src/Shaders/"

Window* w;

std::string printShaderFilePaths(const std::vector<std::string>& shaders);
void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods);

int main(void)
{
    std::vector<std::string> vertShaders;
    std::vector<std::string> fragShaders;
    for (const auto& entry : fs::directory_iterator(PATH))
    {
        std::string fullPath = entry.path().string();
        size_t extStart = fullPath.find_last_of('.');
        std::string ext = fullPath.substr(extStart + 1, fullPath.size() - extStart);
        
        if (ext == "vert")
            vertShaders.push_back(fullPath);
        else if (ext == "frag")
            fragShaders.push_back(fullPath);
    }

    std::cout << "Vertex Shaders" << std::endl;
    std::string vertPath = printShaderFilePaths(vertShaders);
    
    std::cout << "Fragment Shaders" << std::endl;
    std::string fragPath = printShaderFilePaths(fragShaders);

    std::string vertexShader = ParseShader(vertPath);
    std::string fragmentShader = ParseShader(fragPath);

    Window window(1280, 720, vertexShader, fragmentShader);
    w = &window;
    glfwSetKeyCallback(window.getWindow(), key_callback);
    window.Run();
    
    return 0;
}

std::string printShaderFilePaths(const std::vector<std::string>& shaders)
{
    for (int i = 0; i < shaders.size(); i++)
    {
        size_t start = shaders[i].find_last_of('/');
        std::string filename = shaders[i].substr(start + 1, shaders[i].size());
        std::cout << i << ": " << filename << std::endl;
    }

    if (shaders.size() <= 0)
    {
        std::cout << std::endl;
        return std::string();
    }
    else if (shaders.size() == 1)
    {
        std::cout << std::endl;
        return shaders[0];
    }

    unsigned int idx;

    std::cout << "Shader: ";
    std::cin >> idx;
    idx = std::min(idx, shaders.size() - 1);
    
    return shaders[idx];
}

void key_callback(GLFWwindow* window, int key, int scancode, int action, int mods)
{
    w->processEvent(key, action);
}