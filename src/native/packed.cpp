#include "packed.h"
#include <cstring>


template <typename... Fs>
struct Overload : Fs... { using Fs::operator()...; };

template <typename... Fs>
Overload(Fs...) -> Overload<Fs...>;


packed::Value
packed::Value::ref (const Str &value)
{
	Value result;
	result.data.emplace<const std::string *>(&value.str());
	return result;
}

packed::Value
packed::Value::object ()
{
	Value value;
	value.data.emplace<Object>();
	return value;
}

packed::Value
packed::Value::array ()
{
	Value value;
	value.data.emplace<Array>();
	return value;
}

bool
packed::Value::has (const char *key) const
{
	return get(key) != nullptr;
}

const packed::Value *
packed::Value::get (const char *key) const
{
	for (const Member &member : std::get<Object>(data)) {
		if (std::strcmp(member.key, key) == 0) { return &member.value; }
	}
	return nullptr;
}

packed::Value &
packed::Value::set (const char *key, Value value)
{
	Object &members = std::get<Object>(data);
	for (Member &member : members) {
		if (std::strcmp(member.key, key) == 0) {
			member.value = std::move(value);
			return *this;
		}
	}
	members.push_back({ key, std::move(value) });
	return *this;
}

packed::Value &
packed::Value::set (const Str &key, Value value)
{
	return set(key.c_str(), std::move(value));
}

packed::Value &
packed::Value::push (Value value)
{
	std::get<Array>(data).push_back(std::move(value));
	return *this;
}

Napi::Value
packed::Value::toNapi (Napi::Env env) const
{
	return std::visit(Overload {
		[&](std::monostate) -> Napi::Value { return env.Null(); },
		[&](bool value) -> Napi::Value { return Napi::Boolean::New(env, value); },
		[&](int32_t value) -> Napi::Value { return Napi::Number::New(env, value); },
		[&](uint32_t value) -> Napi::Value { return Napi::Number::New(env, value); },
		[&](double value) -> Napi::Value { return Napi::Number::New(env, value); },
		[&](int64_t value) -> Napi::Value { return Napi::BigInt::New(env, value); },
		[&](uint64_t value) -> Napi::Value { return Napi::BigInt::New(env, value); },
		[&](const std::string *value) -> Napi::Value { return Napi::String::New(env, *value); },
		[&](const std::string &value) -> Napi::Value { return Napi::String::New(env, value); },
		[&](const Object &members) -> Napi::Value {
			Napi::Object object = Napi::Object::New(env);
			for (const Member &member : members) {
				object.Set(member.key, member.value.toNapi(env));
			}
			return object;
		},
		[&](const Array &items) -> Napi::Value {
			Napi::Array array = Napi::Array::New(env, items.size());
			for (size_t i = 0; i < items.size(); i++) {
				array.Set((uint32_t) i, items[i].toNapi(env));
			}
			return array;
		},
	}, data);
}
