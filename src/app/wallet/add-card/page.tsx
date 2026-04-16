import AddCardWizard from "./add-card-wizard";
export const metadata = {
  title: "Додавання картки",
};
export default function AddCardPage() {
  return (
    <main className="mb-auto w-full max-w-3xl px-4">
      <AddCardWizard />
    </main>
  );
}
