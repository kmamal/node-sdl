#include <Cocoa/Cocoa.h>

#include "cocoa-global.h"


extern "C" void reenableInertialScrolling() {
	[[NSUserDefaults standardUserDefaults] setBool: YES forKey: @"AppleMomentumScrollSupported"];
}
