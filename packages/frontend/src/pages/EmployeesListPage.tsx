import ListaEmpleados from '../features/employees/components/ListaEmpleados';

export function EmployeesListPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      <div className="max-w-full mx-auto">
        <ListaEmpleados />
      </div>
    </div>
  );
}
