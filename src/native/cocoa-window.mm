#include <Cocoa/Cocoa.h>

#include "cocoa-window.h"

extern "C" CALayer * getView(NSWindow * window) {
	NSView * view = window.contentView;
	[view setWantsLayer:YES];
	return view.layer;
}
