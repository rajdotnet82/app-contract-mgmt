import { useNavigate } from "react-router-dom";
import ContractForm from "./ContractForm";
import { createContract } from "./api";

export default function ContractCreatePage() {
  const nav = useNavigate();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-black dark:text-white">
        Add Contract
      </h1>

      <ContractForm
        submitLabel="Next"
        onSubmit={async (values) => {
          const data = await createContract(values);
          nav(`/contracts/${data._id}`);
        }}
      />
    </div>
  );
}
