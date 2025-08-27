'use client'

import { useState } from 'react'
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileCode,
  BookmarkCheck,
  Share2,
  Printer,
  Mail,
  Copy,
  Check
} from 'lucide-react'
import { ResearchPaper } from '@/types'

interface ExportManagerProps {
  papers: ResearchPaper[]
  savedStudies: string[]
  userQuery?: string
  isOpen: boolean
  onClose: () => void
}

type ExportFormat = 'json' | 'csv' | 'bibtex' | 'ris' | 'pdf'

export default function ExportManager({
  papers,
  savedStudies,
  userQuery,
  isOpen,
  onClose
}: ExportManagerProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json')
  const [includeAbstracts, setIncludeAbstracts] = useState(true)
  const [savedOnly, setSavedOnly] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const exportFormats = [
    {
      id: 'json' as ExportFormat,
      name: 'JSON',
      description: 'Machine-readable format for data analysis',
      icon: FileCode,
      extension: 'json'
    },
    {
      id: 'csv' as ExportFormat,
      name: 'CSV',
      description: 'Spreadsheet format for Excel/Google Sheets',
      icon: FileSpreadsheet,
      extension: 'csv'
    },
    {
      id: 'bibtex' as ExportFormat,
      name: 'BibTeX',
      description: 'LaTeX bibliography format',
      icon: FileText,
      extension: 'bib'
    },
    {
      id: 'ris' as ExportFormat,
      name: 'RIS',
      description: 'Reference manager format (Zotero, Mendeley)',
      icon: FileText,
      extension: 'ris'
    }
  ]

  const getExportData = () => {
    const papersToExport = savedOnly 
      ? papers.filter(p => savedStudies.includes(p.doi || p.title))
      : papers

    return papersToExport
  }

  const generateJSON = (papers: ResearchPaper[]) => {
    const data = papers.map(paper => ({
      title: paper.title,
      authors: paper.authors,
      journal: paper.journal,
      year: paper.year,
      doi: paper.doi,
      pmid: paper.pmid,
      url: paper.url,
      abstract: includeAbstracts ? paper.abstract : undefined,
      study_type: paper.study_type,
      credibility_score: paper.credibility_score,
      citation_count: paper.citation_count,
      source: paper.source,
      keywords: paper.keywords
    }))

    return JSON.stringify({
      query: userQuery,
      export_date: new Date().toISOString(),
      total_papers: data.length,
      papers: data
    }, null, 2)
  }

  const generateCSV = (papers: ResearchPaper[]) => {
    const headers = [
      'Title',
      'Authors',
      'Journal',
      'Year',
      'DOI',
      'PMID',
      'URL',
      'Study Type',
      'Credibility Score',
      'Citation Count',
      'Source'
    ]

    if (includeAbstracts) headers.push('Abstract')

    const rows = papers.map(paper => {
      const row = [
        `"${paper.title.replace(/"/g, '""')}"`,
        `"${paper.authors.join(', ').replace(/"/g, '""')}"`,
        `"${paper.journal.replace(/"/g, '""')}"`,
        paper.year,
        paper.doi || '',
        paper.pmid || '',
        paper.url || '',
        `"${paper.study_type.replace(/"/g, '""')}"`,
        paper.credibility_score,
        paper.citation_count || '',
        `"${paper.source.replace(/"/g, '""')}"`
      ]

      if (includeAbstracts) {
        row.push(`"${paper.abstract.replace(/"/g, '""')}"`)
      }

      return row.join(',')
    })

    return [headers.join(','), ...rows].join('\n')
  }

  const generateBibTeX = (papers: ResearchPaper[]) => {
    return papers.map((paper, index) => {
      const key = paper.doi ? paper.doi.replace(/[^a-zA-Z0-9]/g, '') : `paper${index + 1}`
      
      return `@article{${key},
  title={${paper.title}},
  author={${paper.authors.join(' and ')}},
  journal={${paper.journal}},
  year={${paper.year}},${paper.doi ? `\n  doi={${paper.doi}},` : ''}${paper.url ? `\n  url={${paper.url}},` : ''}
  note={Credibility Score: ${paper.credibility_score}/10}
}`
    }).join('\n\n')
  }

  const generateRIS = (papers: ResearchPaper[]) => {
    return papers.map(paper => {
      let ris = 'TY  - JOUR\n'
      ris += `TI  - ${paper.title}\n`
      
      paper.authors.forEach(author => {
        ris += `AU  - ${author}\n`
      })
      
      ris += `JO  - ${paper.journal}\n`
      ris += `PY  - ${paper.year}\n`
      
      if (paper.doi) ris += `DO  - ${paper.doi}\n`
      if (paper.url) ris += `UR  - ${paper.url}\n`
      if (includeAbstracts) ris += `AB  - ${paper.abstract}\n`
      
      ris += `N1  - Study Type: ${paper.study_type}\n`
      ris += `N1  - Credibility Score: ${paper.credibility_score}/10\n`
      if (paper.citation_count) ris += `N1  - Citations: ${paper.citation_count}\n`
      
      ris += 'ER  - \n'
      
      return ris
    }).join('\n')
  }

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const papersToExport = getExportData()
      let content = ''
      let mimeType = 'text/plain'
      
      switch (selectedFormat) {
        case 'json':
          content = generateJSON(papersToExport)
          mimeType = 'application/json'
          break
        case 'csv':
          content = generateCSV(papersToExport)
          mimeType = 'text/csv'
          break
        case 'bibtex':
          content = generateBibTeX(papersToExport)
          mimeType = 'text/x-bibtex'
          break
        case 'ris':
          content = generateRIS(papersToExport)
          mimeType = 'application/x-research-info-systems'
          break
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      
      const formatInfo = exportFormats.find(f => f.id === selectedFormat)!
      const filename = `sage-research-${savedOnly ? 'saved-' : ''}${userQuery?.replace(/[^a-zA-Z0-9]/g, '-') || 'studies'}-${new Date().toISOString().split('T')[0]}.${formatInfo.extension}`
      
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 3000)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    const papersToExport = getExportData()
    const summary = `Research Summary: ${userQuery}\n\nFound ${papersToExport.length} studies${savedOnly ? ' (saved studies only)' : ''}\n\nTop studies:\n${
      papersToExport.slice(0, 3).map((paper, idx) => 
        `${idx + 1}. ${paper.title} (${paper.year}) - Quality: ${paper.credibility_score.toFixed(1)}/10`
      ).join('\n')
    }\n\nGenerated by Sage AI Research Library`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Research: ${userQuery}`,
          text: summary
        })
      } catch (err) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(summary)
      }
    } else {
      await navigator.clipboard.writeText(summary)
    }
  }

  const handlePrint = () => {
    const papersToExport = getExportData()
    const printWindow = window.open('', '_blank')
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Research Summary - ${userQuery}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
              .study { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
              .title { font-weight: bold; margin-bottom: 5px; }
              .meta { color: #666; font-size: 14px; margin-bottom: 10px; }
              .abstract { margin-top: 10px; line-height: 1.4; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Research Summary: ${userQuery}</h1>
              <p>${papersToExport.length} studies found • Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            ${papersToExport.map((paper, idx) => `
              <div class="study">
                <div class="title">${idx + 1}. ${paper.title}</div>
                <div class="meta">
                  ${paper.authors.slice(0, 3).join(', ')}${paper.authors.length > 3 ? ' et al.' : ''} 
                  • ${paper.journal} (${paper.year})
                  • Quality: ${paper.credibility_score.toFixed(1)}/10
                </div>
                ${includeAbstracts ? `<div class="abstract">${paper.abstract}</div>` : ''}
              </div>
            `).join('')}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  if (!isOpen) return null

  const papersCount = getExportData().length

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Export Research</h2>
                <p className="text-sm text-gray-600">
                  Export {papersCount} studies in your preferred format
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Export Options */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Export Options</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={savedOnly}
                  onChange={(e) => setSavedOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Saved studies only</span>
                  <p className="text-sm text-gray-600">
                    Export only bookmarked studies ({savedStudies.length} saved)
                  </p>
                </div>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeAbstracts}
                  onChange={(e) => setIncludeAbstracts(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Include abstracts</span>
                  <p className="text-sm text-gray-600">
                    Include full abstract text in export (larger file size)
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Export Format</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {exportFormats.map((format) => {
                const IconComponent = format.icon
                const isSelected = selectedFormat === format.id
                
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <IconComponent className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                      <span className="font-medium text-gray-900">{format.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{format.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
            
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Share</span>
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Print</span>
              </button>
              
              <button
                onClick={() => {/* Email functionality */}}
                className="flex items-center justify-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors opacity-50"
                disabled
              >
                <Mail className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Email</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Ready to export {papersCount} studies
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : exportSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Exported!
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}