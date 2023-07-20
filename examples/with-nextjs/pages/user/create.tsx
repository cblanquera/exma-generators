import useCreate from 'shared/models/user/hooks/useCreate';
import DefaultForm from 'shared/models/user/components/DefaultForm';

export default function Page() {
  const { handlers, input, response, status } = useCreate('post', '/api/user/create');
  return (
    <div className="p-4">
      <DefaultForm 
        handlers={handlers} 
        data={input} 
        response={response} 
        status={status} 
      />
    </div>
  );
}