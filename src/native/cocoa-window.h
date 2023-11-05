
#ifndef __OBJC__
class CALayer;
#endif

extern "C" CALayer * getCocoaGlView(NSWindow *);

extern "C" CALayer * getCocoaGpuView(NSWindow *);

extern "C" void reenableInertialScrolling();
