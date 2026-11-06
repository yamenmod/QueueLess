import { useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  ChevronRight,
  Clock3,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Scissors,
  Settings,
  Sparkles,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import './App.css'

type Customer = {
  id: number
  name: string
  service: string
  joinedAt: string
  status: 'waiting' | 'serving' | 'completed' | 'no-show'
}

const initialCustomers: Customer[] = [
  { id: 1, name: 'Jordan Lee', service: 'Skin fade', joinedAt: '9:16 AM', status: 'serving' },
  { id: 2, name: 'Maya Patel', service: 'Haircut', joinedAt: '9:22 AM', status: 'waiting' },
  { id: 3, name: 'Chris Williams', service: 'Beard trim', joinedAt: '9:28 AM', status: 'waiting' },
  { id: 4, name: 'Sofia Martinez', service: 'Haircut', joinedAt: '9:34 AM', status: 'waiting' },
  { id: 5, name: 'Noah Smith', service: 'Skin fade', joinedAt: '9:41 AM', status: 'waiting' },
]

const formatWait = (position: number) => `${Math.max(5, position * 15)} min`

function App() {
  const [customers, setCustomers] = useState(initialCustomers)
  const [queueOpen, setQueueOpen] = useState(true)
  const [customerName, setCustomerName] = useState('')
  const [ticketId, setTicketId] = useState<number | null>(null)
  const [notice, setNotice] = useState('')

  const waitingCustomers = customers.filter((customer) => customer.status === 'waiting')
  const servingCustomer = customers.find((customer) => customer.status === 'serving')

  const joinQueue = () => {
    const name = customerName.trim()
    if (!name) return
    const id = Math.max(...customers.map((customer) => customer.id), 0) + 1
    setCustomers((current) => [
      ...current,
      { id, name, service: 'Haircut', joinedAt: 'Just now', status: 'waiting' },
    ])
    setTicketId(id)
    setCustomerName('')
  }

  const finishAndCallNext = () => {
    const next = waitingCustomers[0]
    if (!next) {
      setCustomers((current) =>
        current.map((customer) =>
          customer.status === 'serving' ? { ...customer, status: 'completed' } : customer,
        ),
      )
      setNotice('The queue is clear. Add a customer to call them next.')
      return
    }
    setCustomers((current) =>
      current.map((customer) => {
        if (customer.status === 'serving') return { ...customer, status: 'completed' }
        if (customer.id === next.id) return { ...customer, status: 'serving' }
        return customer
      }),
    )
    setNotice(`${next.name} is now being served.`)
  }

  const markNoShow = (id: number) => {
    setCustomers((current) =>
      current.map((customer) => (customer.id === id ? { ...customer, status: 'no-show' } : customer)),
    )
  }

  const addWalkIn = () => {
    const name = window.prompt('Customer name')
    if (!name?.trim()) return
    const id = Math.max(...customers.map((customer) => customer.id), 0) + 1
    setCustomers((current) => [
      ...current,
      { id, name: name.trim(), service: 'Walk-in', joinedAt: 'Just now', status: 'waiting' },
    ])
    setNotice(`${name.trim()} was added to the queue.`)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/business/:slug"
          element={
            <CustomerPage
              queueOpen={queueOpen}
              customerName={customerName}
              setCustomerName={setCustomerName}
              joinQueue={joinQueue}
              ticketId={ticketId}
              customers={customers}
              onLeave={() => setTicketId(null)}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              customers={customers}
              queueOpen={queueOpen}
              setQueueOpen={setQueueOpen}
              servingCustomer={servingCustomer}
              waitingCustomers={waitingCustomers}
              finishAndCallNext={finishAndCallNext}
              markNoShow={markNoShow}
              addWalkIn={addWalkIn}
              notice={notice}
            />
          }
        />
        <Route path="*" element={<Navigate to="/business/freshcuts" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function Brand() {
  return (
    <Link to="/business/freshcuts" className="brand" aria-label="QueueLess home">
      <span className="brand-mark"><Scissors size={18} strokeWidth={2.5} /></span>
      <span>Queue<span className="brand-accent">Less</span></span>
    </Link>
  )
}

type CustomerPageProps = {
  queueOpen: boolean
  customerName: string
  setCustomerName: (name: string) => void
  joinQueue: () => void
  ticketId: number | null
  customers: Customer[]
  onLeave: () => void
}

function CustomerPage({ queueOpen, customerName, setCustomerName, joinQueue, ticketId, customers, onLeave }: CustomerPageProps) {
  const ticket = customers.find((customer) => customer.id === ticketId)
  const position = ticket ? customers.filter((customer) => customer.status === 'waiting').findIndex((customer) => customer.id === ticket.id) + 1 : 0

  return (
    <div className="customer-shell">
      <header className="topbar customer-topbar">
        <Brand />
        <Link className="subtle-link" to="/dashboard">Business login <ArrowRight size={15} /></Link>
      </header>
      <main className="customer-main">
        <div className="customer-heading">
          <div className="business-avatar">FC</div>
          <div>
            <p className="eyebrow">WELCOME TO</p>
            <h1>Fresh Cuts Barbershop</h1>
            <p className="muted">Walk-ins welcome · 128 Market Street</p>
          </div>
        </div>

        {ticket ? (
          <section className="ticket-card">
            <div className="ticket-top">
              <div>
                <p className="eyebrow">YOU'RE IN THE QUEUE</p>
                <h2>Hey, {ticket.name.split(' ')[0]}!</h2>
              </div>
              <span className="live-pill"><span /> Live</span>
            </div>
            <div className="ticket-number">{String(ticket.id).padStart(3, '0')}</div>
            <div className="ticket-stats">
              <div><strong>{position || 1}</strong><span>your position</span></div>
              <div><strong>{Math.max(0, position - 1)}</strong><span>ahead of you</span></div>
              <div><strong>{formatWait(position || 1)}</strong><span>estimated wait</span></div>
            </div>
            <div className="progress-track"><div style={{ width: `${Math.max(12, 100 - position * 12)}%` }} /></div>
            <p className="ticket-note"><Sparkles size={16} /> We&apos;ll let you know when your turn is close.</p>
            <button className="text-button" onClick={onLeave}><X size={15} /> Leave queue</button>
          </section>
        ) : (
          <section className="join-card">
            <div className="status-row"><span className="status-dot" /> {queueOpen ? 'Queue is open' : 'Queue is currently closed'}</div>
            <h2>Skip the wait.<br /><span>Your time is yours.</span></h2>
            <p className="muted">Join the virtual queue and we&apos;ll keep you updated. No account or app needed.</p>
            <div className="wait-callout"><Clock3 size={19} /><div><strong>{waitingCount(customers)} people waiting</strong><span>Estimated wait · {formatWait(waitingCount(customers))}</span></div></div>
            <label htmlFor="customer-name">Your name</label>
            <div className="name-input"><UserRound size={18} /><input id="customer-name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && joinQueue()} placeholder="Enter your first and last name" /></div>
            <button className="primary-button full-width" disabled={!queueOpen || !customerName.trim()} onClick={joinQueue}>Join the queue <ArrowRight size={17} /></button>
            <p className="fine-print">By joining, you agree to receive queue updates from Fresh Cuts.</p>
          </section>
        )}

        <div className="service-info">
          <div><strong>Today&apos;s hours</strong><span>9:00 AM – 6:00 PM</span></div>
          <div><strong>Average service</strong><span>15–20 minutes</span></div>
          <div><strong>Need help?</strong><span>(555) 012-4820</span></div>
        </div>
      </main>
      <footer className="customer-footer"><Brand /><span>Powered by QueueLess</span></footer>
    </div>
  )
}

const waitingCount = (customers: Customer[]) => customers.filter((customer) => customer.status === 'waiting').length

function Dashboard({ customers, queueOpen, setQueueOpen, servingCustomer, waitingCustomers, finishAndCallNext, markNoShow, addWalkIn, notice }: {
  customers: Customer[]
  queueOpen: boolean
  setQueueOpen: (open: boolean) => void
  servingCustomer?: Customer
  waitingCustomers: Customer[]
  finishAndCallNext: () => void
  markNoShow: (id: number) => void
  addWalkIn: () => void
  notice: string
}) {
  const [mobileMenu, setMobileMenu] = useState(false)
  const activeCount = customers.filter((customer) => customer.status !== 'completed' && customer.status !== 'no-show').length
  const completedCount = customers.filter((customer) => customer.status === 'completed').length
  const noShowCount = customers.filter((customer) => customer.status === 'no-show').length

  return (
    <div className="dashboard-shell">
      <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
        <Brand />
        <div className="workspace-switcher"><div className="mini-avatar">FC</div><div><strong>Fresh Cuts</strong><span>Business workspace</span></div><ChevronRight size={15} /></div>
        <nav className="side-nav">
          <p>Workspace</p>
          <a className="active" href="#queue"><Users size={17} /> Queue <span className="nav-count">{waitingCustomers.length}</span></a>
          <a href="#analytics"><BarChart3 size={17} /> Analytics</a>
          <a href="#settings"><Settings size={17} /> Settings</a>
        </nav>
        <div className="sidebar-bottom"><div className="user-row"><div className="profile-avatar">AM</div><div><strong>Alex Morgan</strong><span>Owner</span></div><MoreHorizontal size={18} /></div><Link className="logout-link" to="/business/freshcuts"><LogOut size={15} /> View customer page</Link></div>
      </aside>
      <div className="dashboard-content">
        <header className="dashboard-header"><button className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)}><Menu /></button><div><p className="eyebrow">TUESDAY, OCTOBER 15, 2024</p><h1>Good morning, Alex <span>✦</span></h1></div><div className="header-actions"><button className="icon-button"><Bell size={18} /></button><button className="avatar-button">AM</button></div></header>
        <main className="dashboard-main" id="queue">
          {notice && <div className="notice"><Check size={16} /> {notice}</div>}
          <div className="dashboard-title-row"><div><h2>Today&apos;s queue</h2><p className="muted">Manage your customers and keep things moving.</p></div><button className={`queue-toggle ${queueOpen ? 'is-open' : ''}`} onClick={() => setQueueOpen(!queueOpen)}><span /> Queue {queueOpen ? 'open' : 'closed'} <ChevronRight size={15} /></button></div>
          <div className="metrics-grid"><Metric label="In queue" value={activeCount} detail="customers right now" icon={<Users />} accent="blue" /><Metric label="Completed today" value={completedCount + 18} detail="+12% from last Tuesday" icon={<Check />} accent="green" /><Metric label="Avg. wait time" value="18 min" detail="−4 min from yesterday" icon={<Clock3 />} accent="purple" /><Metric label="No-shows" value={noShowCount} detail="this week" icon={<X />} accent="orange" /></div>
          <div className="queue-layout">
            <section className="panel current-panel"><div className="panel-heading"><div><p className="eyebrow">NOW SERVING</p><h3>{servingCustomer?.name ?? 'No one currently serving'}</h3></div><span className="serving-badge"><span /> In service</span></div>{servingCustomer ? <div className="current-customer"><div className="large-avatar">{initials(servingCustomer.name)}</div><div><strong>{servingCustomer.service}</strong><span>Started at {servingCustomer.joinedAt}</span></div><button className="secondary-button" onClick={() => markNoShow(servingCustomer.id)}>Mark no-show</button></div> : <div className="empty-state"><Sparkles size={23} /><p>Your next customer will appear here.</p></div>}<button className="primary-button full-width finish-button" onClick={finishAndCallNext}><Check size={17} /> Finish &amp; call next <span className="shortcut">⌘ ↵</span></button></section>
            <section className="panel waitlist-panel"><div className="panel-heading"><div><p className="eyebrow">UP NEXT</p><h3>Waiting list <span className="heading-count">{waitingCustomers.length}</span></h3></div><button className="add-button" onClick={addWalkIn}><Plus size={16} /> Add walk-in</button></div>{waitingCustomers.length ? <div className="customer-list">{waitingCustomers.map((customer, index) => <div className="customer-row" key={customer.id}><span className="position-number">{String(index + 1).padStart(2, '0')}</span><div className="customer-avatar">{initials(customer.name)}</div><div className="customer-info"><strong>{customer.name}</strong><span>{customer.service} · Joined {customer.joinedAt}</span></div><span className="wait-time">{formatWait(index + 1)}</span><button className="row-menu" onClick={() => markNoShow(customer.id)} aria-label={`Mark ${customer.name} as no-show`}><MoreHorizontal size={18} /></button></div>)}</div> : <div className="empty-state"><Users size={23} /><p>No customers waiting right now.</p></div>}</section>
          </div>
        </main>
      </div>
    </div>
  )
}

function Metric({ label, value, detail, icon, accent }: { label: string; value: string | number; detail: string; icon: React.ReactNode; accent: string }) {
  return <div className="metric-card"><div className={`metric-icon ${accent}`}>{icon}</div><p>{label}</p><strong>{value}</strong><span>{detail}</span></div>
}

const initials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

export default App
