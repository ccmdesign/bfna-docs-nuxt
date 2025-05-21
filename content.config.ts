import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    allvideos: defineCollection({
      source: 'allvideos/*.json',
      type: 'data',
      // Define custom schema for docs collection
      schema: z.object({
        id: z.string(),
        videoId: z.string(),
        order: z.number(),
        title: z.string(),
        subtitle: z.string(),
        by: z.string(),
        description: z.string(),
        videoUrl: z.string().url(),
        workstream: z.string(),
        backgroundImage: z.string().url(),
        source: z.string(),
        screenings: z.array(z.unknown()),
        video_info: z.object({
          title: z.string(),
          teaser_url: z.string().url(),
          teaser_source: z.string(),
          thumb: z.string().url(),
          column_1_text: z.string(),
          column_1_title: z.string(),
          screenshot_extras: z.array(z.unknown())
        }),
        resources: z.array(z.unknown()),
        awards: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            institution: z.string(),
            year: z.number()
          })
        ),
        slug: z.string()
      })
    }),
    fourvideos: defineCollection({
      source: 'fourvideos/*.json',
      type: 'data',
      // Define custom schema for docs collection
      schema: z.object({
        id: z.string(),
        videoId: z.string(),
        title: z.string(),
        subtitle: z.string(),
        by: z.string(),
        description: z.string(),
        videoUrl: z.string().url(),
        workstream: z.string(),
        backgroundImage: z.string().url(),
        source: z.string(),
        screenings: z.array(z.unknown()),
        video_info: z.object({
          title: z.string(),
          teaser_url: z.string().url(),
          teaser_source: z.string(),
          thumb: z.string().url(),
          column_1_text: z.string(),
          column_1_title: z.string(),
          screenshot_extras: z.array(z.unknown())
        }),
        resources: z.array(z.unknown()),
        awards: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            institution: z.string(),
            year: z.number()
          })
        ),
        slug: z.string(),
        featuredOrder: z.number()
      })
    }),
    trailer: defineCollection({
      source: 'trailer/*.json',
      type: 'data',
      // Define custom schema for docs collection
      schema: z.object({
        id: z.string(),
        videoId: z.string(),
        title: z.string(),
        subtitle: z.string(),
        by: z.string(),
        description: z.string(),
        videoUrl: z.string().url(),
        workstream: z.string(),
        backgroundImage: z.string().url(),
        source: z.string(),
        screenings: z.array(z.unknown()),
        video_info: z.object({
          title: z.string(),
          teaser_url: z.string().url(),
          teaser_source: z.string(),
          thumb: z.string().url(),
          column_1_text: z.string(),
          column_1_title: z.string(),
          screenshot_extras: z.array(z.unknown())
        }),
        resources: z.array(z.unknown()),
        awards: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            institution: z.string(),
            year: z.number()
          })
        ),
        slug: z.string()
      })
    }),
    featuredvideo: defineCollection({
      source: 'featuredvideo/*.json',
      type: 'data',
      // Define custom schema for docs collection
      schema: z.object({
        id: z.string(),
        videoId: z.string(),
        title: z.string(),
        subtitle: z.string(),
        by: z.string(),
        description: z.string(),
        videoUrl: z.string().url(),
        workstream: z.string(),
        backgroundImage: z.string().url(),
        source: z.string(),
        screenings: z.array(z.unknown()),
        video_info: z.object({
          title: z.string(),
          teaser_url: z.string().url(),
          teaser_source: z.string(),
          thumb: z.string().url(),
          column_1_text: z.string(),
          column_1_title: z.string(),
          screenshot_extras: z.array(z.unknown())
        }),
        resources: z.array(z.unknown()),
        awards: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            institution: z.string(),
            year: z.number()
          })
        ),
        slug: z.string(),
      })
    })
  }
})
