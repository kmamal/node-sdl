#ifndef _PACKED_H_
#define _PACKED_H_

#include <napi.h>
#include <string>
#include <vector>
#include <variant>
#include <cstdint>

namespace packed {

	struct Member;
	struct Value;

	using Object = std::vector<Member>;
	using Array = std::vector<Value>;

	struct Str {
		Str () = default;
		Str (const Str &) = delete;
		Str &operator= (const Str &) = delete;
		Str &operator= (const char *value) { string = value; return *this; }

		const std::string &str () const { return string; }
		const char *c_str () const { return string.c_str(); }
		operator const std::string & () const { return string; }

	private:
		std::string string;
	};

	struct Value {
		using Data = std::variant<
			std::monostate,
			bool,
			int32_t,
			uint32_t,
			double,
			int64_t,
			uint64_t,
			const std::string *,
			std::string,
			Object,
			Array
		>;

		Data data;

		Value () = default;
		Value (bool value) : data(std::in_place_type<bool>, value) {}
		Value (int32_t value) : data(std::in_place_type<int32_t>, value) {}
		Value (uint32_t value) : data(std::in_place_type<uint32_t>, value) {}
		Value (double value) : data(std::in_place_type<double>, value) {}
		Value (float value) : data(std::in_place_type<double>, value) {}
		Value (int64_t value) : data(std::in_place_type<int64_t>, value) {}
		Value (uint64_t value) : data(std::in_place_type<uint64_t>, value) {}
		Value (const char *value) : data(std::in_place_type<std::string>, value) {}
		Value (const std::string &value) : data(std::in_place_type<std::string>, value) {}
		Value (std::string &&value) : data(std::in_place_type<std::string>, std::move(value)) {}

		static Value ref (const Str &value);
		static Value ref (Str &&value) = delete;
		static Value ref (const std::string &value) = delete;
		static Value ref (std::string &&value) = delete;
		static Value object ();
		static Value array ();

		bool isNull () const { return std::holds_alternative<std::monostate>(data); }
		bool has (const char *key) const;
		const Value *get (const char *key) const;
		const Object &members () const { return std::get<Object>(data); }
		Value &set (const char *key, Value value);
		Value &set (const Str &key, Value value);
		Value &set (Str &&key, Value value) = delete;
		Value &set (const std::string &key, Value value) = delete;
		Value &set (std::string &&key, Value value) = delete;
		Value &push (Value value);

		Napi::Value toNapi (Napi::Env env) const;
	};

	struct Member {
		// Non-owning on purpose: keys are always string literals or static strings, so
		// skipping the copy keeps event packing cheap. Never pass a temporary here.
		const char *key;
		Value value;
	};

}; // namespace packed

#endif // _PACKED_H_
