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

typedef int (* Logger) (const char *, ...);

class Variant : public std::variant<
	std::monostate,                  // 0
	std::map<const char *, Variant>, // 1
	std::vector<Variant>,            // 2
	double,                          // 3
	const char *                     // 4
> {} ;
using VariantMap = std::map<const char *, Variant>;
using VariantList = std::vector<Variant>;

ErrorMessage * getPixelFormats (Logger, Variant & formats);
ErrorMessage * getAudioFormats (Logger, Variant & formats);

ErrorMessage * window_create (
	Logger,
	const char * title,
	int * x, int * y, int * width, int * height,
	bool fullscreen, bool resizable, bool borderless,
	int * window_id
);
ErrorMessage * window_setTitle (Logger, int window_id, const char * title);
ErrorMessage * window_setPosition (Logger, int window_id, int x, int y);
ErrorMessage * window_setSize (Logger, int window_id, int width, int height);
ErrorMessage * window_setFullscreen (Logger, int window_id, bool fullscreen);
ErrorMessage * window_setResizable (Logger, int window_id, bool resizable);
ErrorMessage * window_focus (Logger, int window_id);
ErrorMessage * window_show (Logger, int window_id);
ErrorMessage * window_hide (Logger, int window_id);
ErrorMessage * window_maximize (Logger, int window_id);
ErrorMessage * window_minimize (Logger, int window_id);
ErrorMessage * window_restore (Logger, int window_id);
ErrorMessage * window_setIcon (
	Logger,
	int window_id,
	int w, int h, int stride,
	unsigned int format,
	void * pixels
);
ErrorMessage * window_render (
	Logger,
	int window_id,
	int w, int h, int stride,
	unsigned int format,
	void * pixels
);
ErrorMessage * window_destroy (Logger, int window_id);

ErrorMessage * pollEvent (Logger, Variant & event);
ErrorMessage * waitEvent (Logger, int timeout, Variant & event);

ErrorMessage * audio_start (Logger, int freq, int format, int channels, int samples);
ErrorMessage * audio_getQueuedSize (Logger, unsigned int * size);
ErrorMessage * audio_queue (Logger, void * samples, int number);
ErrorMessage * audio_stop (Logger);

ErrorMessage * cleanup (Logger);

} // namespace

#endif // _SDL_H_
