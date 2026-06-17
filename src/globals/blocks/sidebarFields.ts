import type { Field } from 'payload'
import { adSlotGroup } from '@/lib/adSlotFields'

export const sidebarCategorySectionsField: Field = {
  name: 'categorySections',
  type: 'array',
  label: 'Category News Blocks',
  maxRows: 3,
  admin: {
    description:
      'Add up to 3 category blocks. Pick a category, then choose up to 3 articles from that category.',
    initCollapsed: false,
    components: {
      RowLabel: '@/components/admin/CategorySectionRowLabel#CategorySectionRowLabel',
    },
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Show Block',
      defaultValue: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Category',
      required: true,
    },
    {
      name: 'articles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      maxRows: 3,
      label: 'Articles',
      admin: {
        description: 'Pick up to 3 published articles from the selected category.',
      },
      filterOptions: ({ siblingData }) => {
        const row = siblingData as { category?: string | { id: string } | null }
        const categoryRef = row?.category
        const categoryId =
          typeof categoryRef === 'object' && categoryRef !== null && 'id' in categoryRef
            ? categoryRef.id
            : categoryRef

        if (!categoryId) {
          return false
        }

        return {
          categories: { in: [categoryId] },
          _status: { equals: 'published' },
        }
      },
    },
  ],
}

export const pageSidebarWidgetFields: Field[] = [
  {
    name: 'showTopAd',
    type: 'checkbox',
    label: 'Show Top Sidebar Ad',
    defaultValue: true,
  },
  adSlotGroup('topAd', 'Sidebar Top MPU (300 × 250)'),
  {
    name: 'showMorningBrief',
    type: 'checkbox',
    label: 'Show Morning Brief',
    defaultValue: true,
  },
  {
    name: 'showCategoryNews',
    type: 'checkbox',
    label: 'Show Category News Blocks',
    defaultValue: true,
  },
  sidebarCategorySectionsField,
  {
    name: 'showBottomAd',
    type: 'checkbox',
    label: 'Show Bottom Sidebar Ad',
    defaultValue: true,
  },
  adSlotGroup('bottomAd', 'Sidebar Bottom MPU (300 × 250)'),
]
