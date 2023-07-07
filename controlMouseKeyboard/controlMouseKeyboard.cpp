#include<iostream>
#include<windows.h>
#include <node.h>

#define KEY_DOWN(VK_NONAME) ((GetAsyncKeyState(VK_NONAME) & 0x8000) ? 1:0) //必要的，要背下来


namespace std
{
	using v8::FunctionCallbackInfo;
	using v8::Isolate;
	using v8::Local;
	using v8::Number;
	using v8::Object;
	using v8::String;
	using v8::Value;
	using v8::Context;
	void getCursorPos(const FunctionCallbackInfo<Value>& args)
	{
		/* while (1) {
			 if (KEY_DOWN(MOUSE_MOVED)) {//判断左键
				 printf("你按了鼠标左键\n");
			 }

			 if (KEY_DOWN(MOUSE_EVENT)) {//判断右键
				 printf("你按了鼠标右键\n");
			 }

			 if (KEY_DOWN(MOUSE_WHEELED)) {//判断滚轮
				 printf("你按了鼠标滚轮\n");
			 }

		 }*/
		POINT p;
		GetCursorPos(&p);//获取鼠标坐标 
		Isolate* isolate = args.GetIsolate();
		int isLeft = KEY_DOWN(MOUSE_MOVED) ? 100000000 : 0;
		int isEnd = KEY_DOWN(MOUSE_WHEELED) ? 200000000 : 0;//鼠标滚轮

		args.GetReturnValue().Set(Number::New(isolate, isLeft + isEnd + p.x * 10000 + p.y));
	}
	void move(const FunctionCallbackInfo<Value>& args)
	{

		POINT p;
		Isolate* isolate = args.GetIsolate();
		Local<Context> context = isolate->GetCurrentContext();
		int x = (int)(args[0]->NumberValue(context).ToChecked());
		int y = (int)(args[1]->NumberValue(context).ToChecked());
		int i = args[2]->NumberValue(context).ToChecked()?1:0;

		SetCursorPos(x, y);//更改鼠标坐标
		if (i) {
			mouse_event(MOUSEEVENTF_LEFTDOWN | MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);
		}

		args.GetReturnValue().Set(Number::New(isolate, x * 10000 + y));
	}

	void Initialize(Local<Object> exports)
	{
		NODE_SET_METHOD(exports, "getCursorPos", getCursorPos);
		NODE_SET_METHOD(exports, "move", move);
	}

	NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
}