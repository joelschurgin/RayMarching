#pragma once

#include <string>
#include <iostream>
#include <fstream>

std::string ReadFile(const std::string& path);
std::string FindIncludeStatement(const std::string& file, size_t& start, size_t& end);
std::string ParseShader(const std::string& file);