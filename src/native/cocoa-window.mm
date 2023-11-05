#include <Cocoa/Cocoa.h>

#include "cocoa-window.h"

extern "C" CALayer * getCocoaGlView(NSWindow * window) {
	NSView * view = window.contentView;
	[view setWantsLayer:YES];
	[[view layer] setContentsScale:[nsWindow backingScaleFactor]];
	return view.layer;
}

extern "C" CALayer * getCocoaGpuView(NSWindow * window) {
	NSView * view = window.contentView;
	[view setWantsLayer:YES];
	[view setLayer:[CAMetalLayer layer]];
	[[view layer] setContentsScale:[nsWindow backingScaleFactor]];
	return [view layer];
}

extern "C" void reenableInertialScrolling() {
	[[NSUserDefaults standardUserDefaults] setBool: YES forKey: @"AppleMomentumScrollSupported"];
}
