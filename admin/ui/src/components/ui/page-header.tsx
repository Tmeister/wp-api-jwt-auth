interface PageHeaderProps {
  title: string
  description: string
}

export const PageHeader = ({ title, description }: PageHeaderProps) => (
  <div className="jwt-flex jwt-flex-col md:jwt-flex-row jwt-items-start md:jwt-items-center jwt-justify-between jwt-gap-4 jwt-mb-8">
    <div>
      <h1 className="jwt-text-3xl jwt-font-bold jwt-text-slate-900">{title}</h1>
      <p className="jwt-text-slate-500 jwt-mt-1 jwt-max-w-2xl">{description}</p>
    </div>
  </div>
)
