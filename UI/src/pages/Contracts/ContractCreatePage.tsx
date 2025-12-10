import { useNavigate } from "react-router-dom";
import ContractForm from "./ContractForm";
import { createContract } from "./api";

export default function ContractCreatePage() {
  const nav = useNavigate();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-black dark:text-white">
        Add Contract
      </h1>

      <ContractForm
        submitLabel="Create"
        onSubmit={async (values) => {
          await createContract(values);
          nav("/contracts");
        }}
      />
    </div>
  );
}
