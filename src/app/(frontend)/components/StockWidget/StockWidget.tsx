'use client'

import './StockWidget.css'
import React, { useState } from 'react'
import { MOCK_GAINERS, MOCK_LOSERS } from '../mockData'

export default function StockWidget() {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers')

  const data = activeTab === 'gainers' ? MOCK_GAINERS : MOCK_LOSERS

  return (
    <div className="sidebar-widget-v2">
      <div className="sidebar-widget-header-v2">
        <span className="sidebar-widget-title-v2">Share Market</span>
        <span className="sidebar-widget-more-v2">See more→</span>
      </div>

      {/* Stock Tabs */}
      <div className="stock-tabs-v2">
        <button
          className={`stock-tab-btn-v2 ${activeTab === 'gainers' ? 'active' : ''}`}
          onClick={() => setActiveTab('gainers')}
          style={activeTab === 'gainers' ? { color: 'var(--primary)' } : {}}
        >
          NSE Gainers
        </button>
        <button
          className={`stock-tab-btn-v2 ${activeTab === 'losers' ? 'active' : ''}`}
          onClick={() => setActiveTab('losers')}
          style={activeTab === 'losers' ? { color: 'var(--primary)' } : {}}
        >
          NSE Losers
        </button>
      </div>

      {/* Stock Table */}
      <table className="stock-table-v2">
        <thead>
          <tr>
            <th style={{ width: '60%' }}>Company</th>
            <th style={{ width: '20%', textAlign: 'right' }}>Price</th>
            <th style={{ width: '20%', textAlign: 'right' }}>%Change</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={`${row.company}-${idx}`}>
              <td className="stock-company-name">{row.company}</td>
              <td className="stock-value" style={{ textAlign: 'right' }}>{row.value}</td>
              <td
                className={`stock-change ${activeTab === 'gainers' ? 'up' : 'down'}`}
                style={{ textAlign: 'right' }}
              >
                {row.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="stock-timestamp-v2">
        As of May 5, 2026 · 2:47 PM IST
      </div>
    </div>
  )
}
