const LoginForm = () => {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input className="mt-1 w-full px-3 py-2 border rounded-lg" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input type="password" className="mt-1 w-full px-3 py-2 border rounded-lg" />
      </div>

      <button className="w-full py-2 rounded-lg bg-[#5537ee] text-white">
        Log in
      </button>
    </form>
  );
};

export default LoginForm;
