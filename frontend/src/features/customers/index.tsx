import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useCustomers } from './api'
import { CustomersDialogs } from './components/customers-dialogs'
import { CustomersPrimaryButtons } from './components/customers-primary-buttons'
import { CustomersProvider } from './components/customers-provider'
import { CustomersTable } from './components/customers-table'

export function Customers() {
  const { data, isLoading, isError } = useCustomers()

  return (
    <CustomersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>거래처 관리</h2>
            <p className='text-muted-foreground'>
              레거시 ERP(ndserp) 거래처등록(POVM0001) 화면을 이관한 페이지입니다.
            </p>
          </div>
          <CustomersPrimaryButtons />
        </div>
        {isError ? (
          <div className='rounded-md border border-destructive/50 p-6 text-center text-sm text-destructive'>
            거래처 목록을 불러오지 못했습니다. 백엔드(localhost:8080)가 실행 중인지 확인하세요.
          </div>
        ) : (
          <CustomersTable data={isLoading ? [] : (data ?? [])} />
        )}
      </Main>

      <CustomersDialogs />
    </CustomersProvider>
  )
}
