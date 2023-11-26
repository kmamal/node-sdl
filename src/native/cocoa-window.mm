#include <Cocoa/Cocoa.h>
#import <QuartzCore/CAMetalLayer.h>

#include "cocoa-window.h"

extern "C" CALayer * getCocoaGlView(NSWindow * window) {
	@autoreleasepool {
		NSView * view = [window contentView];
		[view setWantsLayer:YES];
		[[view layer] setContentsScale:[window backingScaleFactor]];
		return [view layer];
	}
}

extern "C" CALayer * getCocoaGpuView(NSWindow * window) {
	@autoreleasepool {
		NSView * view = [window contentView];
		[view setWantsLayer:YES];
		[view setLayer:[CAMetalLayer layer]];
		[[view layer] setContentsScale:[window backingScaleFactor]];
		return [view layer];
	}
}

extern "C" void reenableInertialScrolling() {
	[[NSUserDefaults standardUserDefaults] setBool: YES forKey: @"AppleMomentumScrollSupported"];
}
