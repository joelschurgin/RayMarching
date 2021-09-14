#include "Renderer.h"

Window::Window(const unsigned int& width, const unsigned int& height, const std::string& vs, const std::string& fs)
{
    InitiallizeWindow(width, height);
    CreateBuffers();
    SetShaders(vs, fs);

    // pass in the resolution
    int location = glGetUniformLocation(shader, "u_Resolution");
    glUniform2f(location, width, height);

    // intiallize the time
    startTime = high_resolution_clock::now();
}

Window::~Window()
{
    // delete shader
    glDeleteProgram(shader);

    // free buffers
    glDeleteBuffers(1, &vertexBuffer);
    glDeleteBuffers(1, &indexBuffer);

    glfwTerminate();
}

unsigned int Window::CompileShader(const unsigned int& type, const std::string& source)
{
    unsigned int id = glCreateShader(type);
    const char* src = source.c_str();
    glShaderSource(id, 1, &src, nullptr);
    glCompileShader(id);

    // error handling
    int result;
    glGetShaderiv(id, GL_COMPILE_STATUS, &result);

    if (result != GL_TRUE)
    {
        int length;
        glGetShaderiv(id, GL_INFO_LOG_LENGTH, &length);
        char* message = (char*)alloca(length * sizeof(char));
        glGetShaderInfoLog(id, length, &length, message);

        std::cout << "Failed to compile " << (type == GL_VERTEX_SHADER ? "vertex" : "fragment") << " shader" << std::endl;
        std::cout << message << std::endl;

        glDeleteShader(id);

        return 0;
    }

    return id;
}

unsigned int Window::CreateShader(const std::string& vertexShader, const std::string& fragmentShader)
{
    unsigned int program = glCreateProgram();
    unsigned int vs = CompileShader(GL_VERTEX_SHADER, vertexShader);
    unsigned int fs = CompileShader(GL_FRAGMENT_SHADER, fragmentShader);

    glAttachShader(program, vs);
    glAttachShader(program, fs);
    glLinkProgram(program);
    glValidateProgram(program);

    glDeleteShader(vs);
    glDeleteShader(fs);

    return program;
}

void Window::InitiallizeWindow(const unsigned int& width, const unsigned int& height)
{
    // Initialize glfw
    if (!glfwInit())
        exit(-1);

    // Create a windowed mode window and its OpenGL context
    window = glfwCreateWindow(width, height, "Ray Marching", NULL, NULL);
    if (!window)
    {
        glfwTerminate();
        exit(-1);
    }

    // Make the window's context current
    glfwMakeContextCurrent(window);

    // Initiallize glew
    if (glewInit() != GLEW_OK)
    {
        std::cout << "Error" << std::endl;
        exit(-2);
    }

    // Print opengl version
    std::cout << glGetString(GL_VERSION) << std::endl;
}

void Window::CreateBuffers()
{
    // vertex buffer
    glGenBuffers(1, &vertexBuffer);
    glBindBuffer(GL_ARRAY_BUFFER, vertexBuffer);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    // vertex attributes
    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, sizeof(float) * 2, (const void*)0);

    // index buffer
    glGenBuffers(1, &indexBuffer);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indexBuffer); // tells opengl to use this buffer
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, 6 * 2 * sizeof(unsigned char), indices, GL_STATIC_DRAW);
}

void Window::SetShaders(const std::string& vs, const std::string& fs)
{
    vertexShader = vs;
    fragmentShader = fs;

    shader = CreateShader(vertexShader, fragmentShader);
    glUseProgram(shader);
}

void Window::Run()
{
    // time uniform
    int location = glGetUniformLocation(shader, "u_Time");
    int location2 = glGetUniformLocation(shader, "u_CameraPos");

    // Loop until the user closes the window
    while (!glfwWindowShouldClose(window) && running)
    {
        // Render here
        glClear(GL_COLOR_BUFFER_BIT);

        // pass in the current time
        time = high_resolution_clock::now();
        milliseconds t = duration_cast<milliseconds>(time - startTime);
        glUniform1f(location, t.count());

        // pass in camera
        cameraPos[0] += cameraVelocity[0]; // x
        cameraPos[1] += cameraVelocity[1]; // y
        cameraPos[2] += cameraVelocity[2]; // z
        glUniform3f(location2, cameraPos[0], cameraPos[1], cameraPos[2]);

        // draw vertexBuffer
        glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_BYTE, nullptr);

        // Swap front and back buffers
        glfwSwapBuffers(window);

        // Poll for and process events
        glfwPollEvents();
    }
}

void Window::processEvent(int key, int action)
{
    // z direction
    if (key == GLFW_KEY_W)
    {
        if (action == GLFW_PRESS)
            cameraVelocity[2] = cameraSpeed;
        else if (action == GLFW_RELEASE)
            cameraVelocity[2] = 0.0f;
    }
    else if (key == GLFW_KEY_S)
    {
        if (action == GLFW_PRESS)
            cameraVelocity[2] = -cameraSpeed;
        else if (action == GLFW_RELEASE)
            cameraVelocity[2] = 0.0f;
    }
    // x direction
    else if (key == GLFW_KEY_A)
    {
        if (action == GLFW_PRESS)
            cameraVelocity[0] = -cameraSpeed;
        else if (action == GLFW_RELEASE)
            cameraVelocity[0] = 0.0f;
    }
    else if (key == GLFW_KEY_D)
    {
        if (action == GLFW_PRESS)
            cameraVelocity[0] = cameraSpeed;
        else if (action == GLFW_RELEASE)
            cameraVelocity[0] = 0.0f;
    }
    else if (key == GLFW_KEY_Q)
    {
        if (action == GLFW_PRESS)
            running = false;
    }
}
