#include <Cocoa/Cocoa.h>

#include "cocoa-window.h"

extern "C" CALayer * getCocoaView(NSWindow * window) {
	NSView * view = window.contentView;
	[view setWantsLayer:YES];
	return view.layer;
}

extern "C" void reenableInertialScrolling() {
	[[NSUserDefaults standardUserDefaults] setBool: YES forKey: @"AppleMomentumScrollSupported"];
}
