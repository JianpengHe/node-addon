#include <Windows.h>
#include <node.h>

#define EPOCH_DIFF 116444736000000000 // FILETIME starts from 1601-01-01 UTC, epoch from 1970- 01-01
#define RATE_DIFF 10000000

using v8::Context;
using v8::Exception;
using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;

void UnixTimeToFileTime(__time64_t tmUnixTime, LPFILETIME pFileTime)
{
    __int64 ll;
    ll = tmUnixTime * RATE_DIFF + EPOCH_DIFF;
    pFileTime->dwLowDateTime = (DWORD)ll;
    pFileTime->dwHighDateTime = ll >> 32;
}

const char *argToChar(Local<Value> arg, Isolate *isolate, Local<Context> context)
{
    String::Utf8Value str(isolate, arg->ToString(context).ToLocalChecked());
    return *str ? *str : "<string conversion failed>";
}
unsigned int argToUint(Local<Value> arg, Local<Context> context)
{
    return arg->Uint32Value(context).FromJust();
}
void returnUint32(unsigned int value, Isolate *isolate, const FunctionCallbackInfo<Value> &args)
{
    args.GetReturnValue().Set(v8::Uint32::New(isolate, 0));
}
void throwError(Isolate *isolate, char *msg)
{
    isolate->ThrowException(Exception::TypeError(String::NewFromUtf8(isolate, msg).ToLocalChecked()));
}

namespace std
{
    void fileTime(const FunctionCallbackInfo<Value> &args)
    {
        Isolate *isolate = args.GetIsolate();
        Local<Context> context = isolate->GetCurrentContext();
        if (args.Length() < 2)
        {
            throwError(isolate, "Wrong number of arguments.");
            return;
        }
        if (args[0]->IsNull() || args[0]->IsUndefined() || !args[0]->IsString())
        {
            throwError(isolate, "File name must be a string.");
            return;
        }
        const char *fileName = argToChar(args[0], isolate, context);
        unsigned int ctime = args[1]->Uint32Value(isolate->GetCurrentContext()).FromJust();
        unsigned int mtime = args.Length() > 2 ? argToUint(args[2], context) : ctime;
        unsigned int atime = args.Length() > 3 ? argToUint(args[3], context) : mtime;

        HANDLE hFile = CreateFile(fileName, GENERIC_READ | GENERIC_WRITE, FILE_SHARE_READ | FILE_SHARE_DELETE, NULL, OPEN_EXISTING, FILE_FLAG_BACKUP_SEMANTICS, NULL);
        if (hFile == INVALID_HANDLE_VALUE)
        {
            throwError(isolate, "Get file handle failed.");
            // cout << "Get file handle failed,error = " << GetLastError();
            return;
        }
        FILETIME CreationTime, LastAccessTime, LastWriteTime;
        UnixTimeToFileTime(ctime, &CreationTime);
        UnixTimeToFileTime(mtime, &LastWriteTime);
        UnixTimeToFileTime(atime, &LastAccessTime);
        unsigned int result = SetFileTime(hFile, &CreationTime, &LastAccessTime, &LastWriteTime) ? 0 : -1;
        returnUint32(result, isolate, args);
        CloseHandle(hFile);
    }
    void Initialize(Local<Object> exports)
    {
        NODE_SET_METHOD(exports, "fileTime", fileTime);
    }

    NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize);
}