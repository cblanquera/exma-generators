import Link from 'next/link';

export default function Page() {
  return (
    <div className="p-4">
      <h1>Models</h1>
      <ul>
        <li><Link className="text-blue-500 font-bold" href="/user">Users</Link></li>
      </ul>
    </div>
  );
}