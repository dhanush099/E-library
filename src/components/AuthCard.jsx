export default function AuthCard({ title, children, color }) {
  return (
    <div className="flex justify-center items-center min-h-[75vh] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div
        className={`backdrop-blur-xl bg-white/70 p-8 rounded-3xl shadow-xl w-full max-w-md border-t-4 ${color} transition-all duration-500 hover:shadow-2xl`}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>
        {children}
      </div>
    </div>
  );
}
