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

struct Framebuffer {
	int w;
	int h;
	int stride;
	void * pixels;
};

ErrorMessage * createWindow (
	Logger,
	const char * title,
	int x, int y, int w, int h,
	int * window_id,
	Framebuffer *
);
ErrorMessage * updateWindow (Logger, int window_id);
ErrorMessage * destroyWindow (Logger, int window_id);

ErrorMessage * pollEvent (Logger, Variant & event);
ErrorMessage * waitEvent (Logger, Variant & event, int timeout);

ErrorMessage * startAudio (Logger);
ErrorMessage * stopAudio (Logger);

ErrorMessage * cleanup (Logger);

} // namespace

#endif // _SDL_H_
