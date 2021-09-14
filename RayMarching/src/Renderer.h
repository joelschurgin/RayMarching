#pragma once

#include <GL/glew.h>
#include <GLFW/glfw3.h>
#include <iostream>
#include <chrono>

using namespace std::chrono;

class Window
{
public:
	Window(const unsigned int& width, const unsigned int& height, const std::string& vs, const std::string& fs);
	~Window();

private:
	unsigned int CompileShader(const unsigned int& type, const std::string& source);
	unsigned int CreateShader(const std::string& vertexShader, const std::string& fragmentShader);

    void InitiallizeWindow(const unsigned int& width, const unsigned int& height);
    void CreateBuffers();
    void SetShaders(const std::string& vs, const std::string& fs);

public:
    void Run();
    void processEvent(int key, int action);

    unsigned int getShader() { return shader; }
    GLFWwindow* getWindow() { return window; }

private:
    GLFWwindow* window;

    float vertices[8] = {
        -1.0f, -1.0f,
         1.0f, -1.0f,
         1.0f,  1.0f,
        -1.0f,  1.0f
    };

    unsigned char indices[6] = {
        0, 1, 2,
        2, 3, 0
    };

    unsigned int vertexBuffer;
    unsigned int indexBuffer;

    std::string vertexShader;
    std::string fragmentShader;

    unsigned int shader;

    high_resolution_clock::time_point time;
    high_resolution_clock::time_point startTime;

    const float cameraSpeed = 0.05f;

    float cameraPos[3] = { 0.0f, 0.0f, 0.0f };
    float cameraVelocity[3]{ 0.0f, 0.0f, 0.0f };

    bool running = true;
};