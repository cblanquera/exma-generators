import type { FormEvent } from 'react';
import type { UserExtended } from 'shared';

import Button from 'frui-tailwind/Button';
import Link from 'next/link';

import useSearch from 'shared/models/user/hooks/useSearch';
import DefaultTable from 'shared/models/user/components/DefaultTable';
import { UserRoles } from 'shared/store/types';

export default function Page() {
  const { handlers, filters, response, status } = useSearch({}, 'get', '/api/user/search');

  const rows: UserExtended[] = [
    {
      id: 'ahg',
      name: 'John Doe',
      companyId: 'AHG',
      username: 'johndoe',
      role: UserRoles.ADMIN,
      active: true,
      lastLogin: new Date(),
      created: new Date(),
      updated: new Date()
    },
    {
      id: 'shoppable',
      name: 'Janet Doe',
      companyId: 'Shoppable',
      username: 'janetdoe',
      role: UserRoles.USER,
      active: true,
      lastLogin: new Date(),
      created: new Date(),
      updated: new Date()
    }
  ]
  return (
    <div className="p-4">
      <div className="text-right">
        <Button success>
          <Link href="/user/create">
            <i className="fas fa-plus"></i>
            Create User
          </Link>
        </Button>
      </div>
      <div className="mt-2">
        <DefaultTable 
          rows={rows}
          stripes={['bg-b1', 'bg-b0']}
          handlers={{...handlers, send: (e: FormEvent) => false}}
          filters={filters}
        />
      </div>
    </div>
  );
}