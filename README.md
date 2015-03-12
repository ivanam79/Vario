# Vario
A simple lightweight javascript SPA framework with support for 2 way data binding and components

Main goals:
- Support all the features a normal SPA does
- Keep the framework pluggable. As a minimum we want to be able to implement components and custom data binding implementations without modifying the framework itself
- Keep the javascript sent to the browser to the very minimum. We'll have a complex build system, which produces a single minified javascript file. Templates, components, view models and the framework itself will be embedded in it.
- Not depend on any external libraries
- Stick to a very strict backward compatibility policy
- Create a friendly community around Vario
