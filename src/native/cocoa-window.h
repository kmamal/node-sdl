#ifndef _COCOA_WINDOW_H_
#define _COCOA_WINDOW_H_


#ifndef __OBJC__
class CALayer;
#endif

extern "C" CALayer *getCocoaGlView(NSWindow *);

extern "C" CALayer *getCocoaGpuView(NSWindow *);

extern "C" void reenableInertialScrolling();


#endif // _COCOA_WINDOW_H_
