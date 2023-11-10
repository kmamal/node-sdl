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


ErrorMessage * enum_getEventFamilies (Variant & object);
ErrorMessage * enum_getEventTypes (Variant & object);
ErrorMessage * enum_getPixelFormats (Variant & object);
ErrorMessage * enum_getAudioFormats (Variant & object);
ErrorMessage * enum_getScancodes (Variant & object);
ErrorMessage * enum_getMouseButtons (Variant & object);
ErrorMessage * enum_getCursors (Variant & object);
ErrorMessage * enum_getHatPositions (Variant & object);
ErrorMessage * enum_getPowerLevels (Variant & object);
ErrorMessage * enum_getJoystickTypes (Variant & object);
ErrorMessage * enum_getControllerAxes (Variant & object);
ErrorMessage * enum_getControllerButtons (Variant & object);
ErrorMessage * enum_getSensorTypes (Variant & object);
ErrorMessage * enum_getPowerStates (Variant & object);

ErrorMessage * initialize (Variant & object);
ErrorMessage * cleanup ();

ErrorMessage * events_poll (Variant & event);
ErrorMessage * events_wait (int timeout, Variant & event);

ErrorMessage * video_getDisplays (Variant & list);

ErrorMessage * window_create (
	const char * title, int display,
	int ** x, int ** y, int ** width, int ** height,
	int * pixel_width, int * pixel_height,
	bool visible,
	bool * fullscreen,
	bool * resizable,
	bool * borderless,
	bool * alwaysOnTop,
	bool * accelerated,
	bool * vsync,
	bool opengl,
	bool webgpu,
	bool * skipTaskbar,
	bool * popupMenu,
	bool * tooltip,
	bool * utility,
	int * window_id, void ** native_pointer, int * native_size
);
ErrorMessage * window_setTitle (int window_id, const char * title);
ErrorMessage * window_setPosition (int window_id, int x, int y);
ErrorMessage * window_setSize (
	int window_id, int width, int height,
	int * pixel_width, int * pixel_height
);
ErrorMessage * window_setFullscreen (int window_id, bool * fullscreen);
ErrorMessage * window_setResizable (int window_id, bool * resizable);
ErrorMessage * window_setBorderless (int window_id, bool * borderless);
ErrorMessage * window_setAcceleratedAndVsync (
	int window_id,
	bool * accelerated,
	bool * vsync
);
ErrorMessage * window_focus (int window_id);
ErrorMessage * window_show (int window_id);
ErrorMessage * window_hide (int window_id);
ErrorMessage * window_maximize (int window_id);
ErrorMessage * window_minimize (int window_id);
ErrorMessage * window_restore (int window_id);
ErrorMessage * window_render (
	int window_id,
	int w, int h, int stride,
	unsigned int format,
	void * pixels
);
ErrorMessage * window_setIcon (
	int window_id,
	int w, int h, int stride,
	unsigned int format,
	void * pixels
);
ErrorMessage * window_flash (int window_id, int type);
ErrorMessage * window_destroy (int window_id);

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
ErrorMessage * joystick_close (int joystick_id);
ErrorMessage * joystick_getPower (int joystick_id, int * power);
ErrorMessage * joystick_setLed (
	int joystick_id,
	double red,
	double green,
	double blue
);
ErrorMessage * joystick_setPlayer (int joystick_id, int player);
ErrorMessage * joystick_rumble (
	int joystick_id,
	double low_freq_rumble,
	double high_freq_rumble,
	int duration
);
ErrorMessage * joystick_rumbleTriggers (
	int joystick_id,
	double left_rumble,
	double right_rumble,
	int duration
);

ErrorMessage * controller_open (int index, Variant & object);
ErrorMessage * controller_close (int controller_id);
ErrorMessage * controller_addMappings (char ** mappings, int length);

ErrorMessage * sensor_getDevices (Variant & list);
ErrorMessage * sensor_open (int index);
ErrorMessage * sensor_close (int sensor_id);
ErrorMessage * sensor_getData (int sensor_id, Variant & object);

ErrorMessage * audio_getDevices (bool capture, Variant & list);
ErrorMessage * audio_openDevice (
	const char * name, bool capture,
	int freq, int format, int channels, int samples,
	int * audio_id
);
ErrorMessage * audio_close (int audio_id);
ErrorMessage * audio_play (int audio_id, bool play);
ErrorMessage * audio_getQueueSize (int audio_id, unsigned int * size);
ErrorMessage * audio_clearQueue (int audio_id);
ErrorMessage * audio_enqueue (int audio_id, void * src, int size);
ErrorMessage * audio_dequeue (int audio_id, void * dst, int size, int * num);

ErrorMessage * clipboard_getText (const char ** text);
ErrorMessage * clipboard_setText (const char * text);

ErrorMessage * power_getInfo (Variant & info);

} // namespace

#endif // _SDL_H_
