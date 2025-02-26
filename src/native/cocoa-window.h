#ifndef _COCOA_WINDOW_H_
#define _COCOA_WINDOW_H_


#ifndef __OBJC__
	class NSView;
	class CALayer;
#endif


extern "C" NSView *getCocoaWindowHandle(NSWindow *);

extern "C" CALayer *getCocoaGlView(NSWindow *);

extern "C" CALayer *getCocoaGpuView(NSWindow *);


#endif // _COCOA_WINDOW_H_
