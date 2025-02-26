#include <Cocoa/Cocoa.h>
#include <QuartzCore/CAMetalLayer.h>

#include "cocoa-window.h"


extern "C" NSView *getCocoaWindowHandle(NSWindow *window) {
	@autoreleasepool {
		return [window contentView];
	}
}

extern "C" CALayer *getCocoaGlView(NSWindow *window) {
	@autoreleasepool {
		NSView *view = [window contentView];
		[view setWantsLayer:YES];
		[[view layer] setContentsScale:[window backingScaleFactor]];
		return [view layer];
	}
}

extern "C" CALayer *getCocoaGpuView(NSWindow *window) {
	@autoreleasepool {
		NSView *view = [window contentView];
		[view setWantsLayer:YES];
		[view setLayer:[CAMetalLayer layer]];
		[[view layer] setContentsScale:[window backingScaleFactor]];
		return [view layer];
	}
}
