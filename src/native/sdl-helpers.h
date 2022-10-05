#ifndef _SDL_H_
#define _SDL_H_

#include <variant>
#include <map>
#include <vector>
#include <string>

namespace SdlHelpers {

class ErrorMessage
{
public:

	ErrorMessage(const char * _message, bool _should_dispose = true);
	~ErrorMessage();

	const char * message;
	bool should_dispose;
};


class Variant : public std::variant<
	std::monostate,                  // 0
	std::map<const char *, Variant>, // 1
	std::vector<Variant>,            // 2
	double,                          // 3
	const char *,                    // 4
	bool                             // 5
> {} ;
using VariantMap = std::map<const char *, Variant>;
using VariantList = std::vector<Variant>;


ErrorMessage * enum_getPixelFormats (Variant & object);
ErrorMessage * enum_getAudioFormats (Variant & object);
ErrorMessage * enum_getScancodes (Variant & object);
ErrorMessage * enum_getMouseButtons (Variant & object);
ErrorMessage * enum_getCursors (Variant & object);
ErrorMessage * enum_getHatPositions (Variant & object);
ErrorMessage * enum_getPowerLevels (Variant & object);


ErrorMessage * initialize (Variant & object);
ErrorMessage * cleanup ();

ErrorMessage * video_getDisplays (Variant & list);

ErrorMessage * window_create (
	const char * title, int display,
	int ** x, int ** y, int ** width, int ** height,
	bool visible,
	bool fullscreen,
	bool resizable,
	bool borderless,
	bool accelerated,
	bool vsync,
	bool opengl,
	int * window_id, void ** native_pointer, int * native_pointer_size
);
ErrorMessage * window_setTitle (int window_id, const char * title);
ErrorMessage * window_setPosition (int window_id, int x, int y);
ErrorMessage * window_setSize (int window_id, int width, int height);
ErrorMessage * window_setFullscreen (int window_id, bool fullscreen);
ErrorMessage * window_setResizable (int window_id, bool resizable);
ErrorMessage * window_setBorderless (int window_id, bool borderless);
ErrorMessage * window_setAcceleratedAndVsync (int window_id, bool accelerated, bool vsync);
ErrorMessage * window_focus (int window_id);
ErrorMessage * window_show (int window_id);
ErrorMessage * window_hide (int window_id);
ErrorMessage * window_maximize (int window_id);
ErrorMessage * window_minimize (int window_id);
ErrorMessage * window_restore (int window_id);
ErrorMessage * window_setIcon (
	int window_id,
	int w, int h, int stride,
	unsigned int format,
	void * pixels
);
ErrorMessage * window_render (
	int window_id,
	int w, int h, int stride,
	unsigned int format,
	void * pixels
);
ErrorMessage * window_present (int window_id);
ErrorMessage * window_clear (int window_id);
ErrorMessage * window_setDrawColor (int window_id, int r, int g, int b, int a);
ErrorMessage * window_setDrawColor (int window_id, int r, int g, int b, int a);
ErrorMessage * window_drawRect (int window_id, int x, int y, int w, int h, bool fill);
ErrorMessage * window_drawLine (int window_id, int x1, int y1, int x2, int y2);
ErrorMessage * window_drawPoint (int window_id, int x, int y);
ErrorMessage * window_destroy (int window_id);

ErrorMessage * audio_getDevices (bool capture, Variant & list);
ErrorMessage * audio_openDevice (
	const char * name, bool capture,
	int freq, int format, int channels, int samples,
	int * device_id
);
ErrorMessage * audio_close (int device_id);
ErrorMessage * audio_play (int device_id, bool play);
ErrorMessage * audio_getQueueSize (int device_id, unsigned int * size);
ErrorMessage * audio_clearQueue (int device_id);
ErrorMessage * audio_enqueue (int device_id, void * src, int size);
ErrorMessage * audio_dequeue (int device_id, void * dst, int size, int * num);

ErrorMessage * events_poll (Variant & event);
ErrorMessage * events_wait (int timeout, Variant & event);

ErrorMessage * keyboard_getKey (int scancode, const char ** key);
ErrorMessage * keyboard_getScancode (const char * key, int * scancode);
ErrorMessage * keyboard_getState (Variant & list);

ErrorMessage * mouse_getButton (int button, int * state);
ErrorMessage * mouse_getPosition (Variant & position);
ErrorMessage * mouse_setPosition (int x, int y);
ErrorMessage * mouse_capture (bool capture);
ErrorMessage * mouse_setCursor (int cursor_id);
ErrorMessage * mouse_setCursorImage (
	int w, int h, int stride,
	unsigned int format,
	void * pixels,
	int x, int y
);
ErrorMessage * mouse_showCursor (bool show);

ErrorMessage * joystick_getDevices (Variant & list);
ErrorMessage * joystick_open (int index, Variant & device);
ErrorMessage * joystick_close (int device_id);
ErrorMessage * joystick_getPower (int device_id, int * power);

ErrorMessage * controller_open (int index, Variant & device);
ErrorMessage * controller_close (int device_id);

ErrorMessage * clipboard_getText (const char ** text);
ErrorMessage * clipboard_setText (const char * text);

} // namespace

#endif // _SDL_H_
