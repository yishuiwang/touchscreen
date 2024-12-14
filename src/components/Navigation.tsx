'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navigation = () => {
  const pathname = usePathname()
  
  const links = [
    { href: '/', label: '触摸轨迹' },
    { href: '/history', label: '历史记录' },
    { href: '/train', label: '训练结果' },
    { href: '/evaluate', label: '模型评估' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'white',
      padding: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      zIndex: 1000
    }}>
      <ul style={{
        display: 'flex',
        gap: '2rem',
        margin: 0,
        padding: 0,
        listStyle: 'none'
      }}>
        {links.map(link => (
          <li key={link.href}>
            <Link 
              href={link.href}
              style={{
                color: pathname === link.href ? '#007bff' : '#333',
                textDecoration: 'none',
                fontWeight: pathname === link.href ? 'bold' : 'normal'
              }}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Navigation 