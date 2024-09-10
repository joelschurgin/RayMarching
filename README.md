# RayMarching

This ray marching engine uses GLEW and GLFW to run OpenGL. Most of the OpenGL code exists to render a rectangle that's the size of the screen as well as to pass input data to the shaders. The bulk of the relavent code is written as fragment shaders. When the application first runs, a prompt is opened up with the option to choose which fragment shader to use. Type the number left of the shader to run it.

Ray marching is a relatively unknown way of rendering 3D objects, but it's efficiency comes from a special function called the "distance estimator" which takes in a position in 3D space and outputs the furthest distance to the closest object. Instead of having to model an object and render a bunch of triangles, we just have to have a single function that defines the distance to the objects in the scene. This is really powerful for rendering fractals since fractals are really hard to render with any sort of detail if all we can do is use a combination of triangles. By finding a neat function that represents the distance to the fractal from an arbitrary point in space, then we render the fractal in high detail for a mere fraction of the computational effort.

For a great explanation of what ray marching is, check out Code Parade's video: https://youtu.be/svLzmFuSBhk
For more in depth and mathematical explanations I referenced Inigo Quilez's website: https://iquilezles.org/www/index.htm
           
Controls:
- W (move camera up)
- A (move camera left)
- S (move camera down)
- D (move camera right)

Future Improvements:
- Of course adding more shaders
- Camera rotation (maybe based on mouse movement)
- Add a 4D mode since all that has to be done for that is to switch all the vec3's to vec4's and the math takes care of the rest. However, this is a bit clunky since we would have to take a 3D slice of 4D space and project that on to a 2D image.
- Object collisions and physics
