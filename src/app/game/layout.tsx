
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`bg-gray-700 text-white`}
    >
      {children}
    </div>
  );
}
