export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          cancelled_at: string | null
          category_id: string
          children: string[] | null
          club_slug: string
          coach_slug: string | null
          created_at: string
          ends_at: string
          feedback_done: boolean
          hold_expires_at: string | null
          household_id: string
          id: string
          kind: string
          member_id: string
          no_strike: boolean
          owner_id: string
          payment: string | null
          place: string
          players: Json | null
          ref: string
          resource: string | null
          session_id: string | null
          sport: string | null
          spot: string | null
          starts_at: string
          status: string
          title: string
          updated_at: string
          waitlist_position: number | null
        }
        Insert: {
          cancelled_at?: string | null
          category_id: string
          children?: string[] | null
          club_slug: string
          coach_slug?: string | null
          created_at: string
          ends_at: string
          feedback_done?: boolean
          hold_expires_at?: string | null
          household_id: string
          id: string
          kind: string
          member_id: string
          no_strike?: boolean
          owner_id: string
          payment?: string | null
          place?: string
          players?: Json | null
          ref: string
          resource?: string | null
          session_id?: string | null
          sport?: string | null
          spot?: string | null
          starts_at: string
          status: string
          title: string
          updated_at?: string
          waitlist_position?: number | null
        }
        Update: {
          cancelled_at?: string | null
          category_id?: string
          children?: string[] | null
          club_slug?: string
          coach_slug?: string | null
          created_at?: string
          ends_at?: string
          feedback_done?: boolean
          hold_expires_at?: string | null
          household_id?: string
          id?: string
          kind?: string
          member_id?: string
          no_strike?: boolean
          owner_id?: string
          payment?: string | null
          place?: string
          players?: Json | null
          ref?: string
          resource?: string | null
          session_id?: string | null
          sport?: string | null
          spot?: string | null
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
          waitlist_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_club_slug_fkey"
            columns: ["club_slug"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "bookings_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          blurb: string
          examples: string
          hero_caption: string
          id: string
          intensity_max: number
          intensity_min: number
          lede: string
          name: string
          sort: number
          tagline: string
        }
        Insert: {
          blurb?: string
          examples?: string
          hero_caption?: string
          id: string
          intensity_max?: number
          intensity_min?: number
          lede?: string
          name: string
          sort: number
          tagline?: string
        }
        Update: {
          blurb?: string
          examples?: string
          hero_caption?: string
          id?: string
          intensity_max?: number
          intensity_min?: number
          lede?: string
          name?: string
          sort?: number
          tagline?: string
        }
        Relationships: []
      }
      class_schedules: {
        Row: {
          class_key: string
          club_slug: string
          coach_id: string
          days: number[]
          id: number
          intensity: number | null
          start_time: string
          studio: string
        }
        Insert: {
          class_key: string
          club_slug: string
          coach_id: string
          days: number[]
          id?: never
          intensity?: number | null
          start_time: string
          studio: string
        }
        Update: {
          class_key?: string
          club_slug?: string
          coach_id?: string
          days?: number[]
          id?: never
          intensity?: number | null
          start_time?: string
          studio?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_schedules_class_key_fkey"
            columns: ["class_key"]
            isOneToOne: false
            referencedRelation: "class_types"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "class_schedules_club_slug_fkey"
            columns: ["club_slug"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "class_schedules_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      class_types: {
        Row: {
          about: string
          blurb: string
          bookable: boolean
          bring: string[]
          capacity: number
          caption: string
          category_id: string
          club_slugs: string[] | null
          duration: number
          equipment_note: string
          first_timer_ok: boolean
          gear: string
          group_label: string
          intensity: number
          intensity_max: number
          intensity_min: number
          key: string
          min_age: number
          name: string
          pick: string
          slug: string
          sort: number
          teen_ok: boolean
          unit: string
        }
        Insert: {
          about?: string
          blurb?: string
          bookable?: boolean
          bring?: string[]
          capacity: number
          caption?: string
          category_id: string
          club_slugs?: string[] | null
          duration: number
          equipment_note?: string
          first_timer_ok?: boolean
          gear?: string
          group_label?: string
          intensity: number
          intensity_max: number
          intensity_min: number
          key: string
          min_age?: number
          name: string
          pick?: string
          slug: string
          sort: number
          teen_ok?: boolean
          unit: string
        }
        Update: {
          about?: string
          blurb?: string
          bookable?: boolean
          bring?: string[]
          capacity?: number
          caption?: string
          category_id?: string
          club_slugs?: string[] | null
          duration?: number
          equipment_note?: string
          first_timer_ok?: boolean
          gear?: string
          group_label?: string
          intensity?: number
          intensity_max?: number
          intensity_min?: number
          key?: string
          min_age?: number
          name?: string
          pick?: string
          slug?: string
          sort?: number
          teen_ok?: boolean
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          access_notes: string
          address: string
          amenities: string[]
          city: string
          club_type: string
          courts: Json
          cross_streets: string
          demo_busyness: number | null
          demo_miles: number | null
          extras: string
          has: Json
          intro: string
          kids_club: boolean
          lat: number
          legacy_id: string
          lng: number
          map_x: number | null
          map_y: number | null
          name: string
          neighborhood: string
          opened: number | null
          parking: string
          personality: string
          phone: string
          photo_caption: string
          pool: Json | null
          recovery: string
          scene: string
          short_name: string
          signature: string[]
          site_amenities: string[]
          slug: string
          sort: number
          sqft: number
          studio_count: number
          studios: string[]
          tel: string
          tone: string
          type_label: string
          typical_weekday: number[]
          typical_weekend: number[]
          zip: string
        }
        Insert: {
          access_notes?: string
          address: string
          amenities?: string[]
          city: string
          club_type: string
          courts?: Json
          cross_streets: string
          demo_busyness?: number | null
          demo_miles?: number | null
          extras?: string
          has?: Json
          intro?: string
          kids_club?: boolean
          lat: number
          legacy_id: string
          lng: number
          map_x?: number | null
          map_y?: number | null
          name: string
          neighborhood: string
          opened?: number | null
          parking?: string
          personality: string
          phone: string
          photo_caption?: string
          pool?: Json | null
          recovery?: string
          scene: string
          short_name: string
          signature?: string[]
          site_amenities?: string[]
          slug: string
          sort: number
          sqft: number
          studio_count?: number
          studios?: string[]
          tel: string
          tone?: string
          type_label: string
          typical_weekday?: number[]
          typical_weekend?: number[]
          zip: string
        }
        Update: {
          access_notes?: string
          address?: string
          amenities?: string[]
          city?: string
          club_type?: string
          courts?: Json
          cross_streets?: string
          demo_busyness?: number | null
          demo_miles?: number | null
          extras?: string
          has?: Json
          intro?: string
          kids_club?: boolean
          lat?: number
          legacy_id?: string
          lng?: number
          map_x?: number | null
          map_y?: number | null
          name?: string
          neighborhood?: string
          opened?: number | null
          parking?: string
          personality?: string
          phone?: string
          photo_caption?: string
          pool?: Json | null
          recovery?: string
          scene?: string
          short_name?: string
          signature?: string[]
          site_amenities?: string[]
          slug?: string
          sort?: number
          sqft?: number
          studio_count?: number
          studios?: string[]
          tel?: string
          tone?: string
          type_label?: string
          typical_weekday?: number[]
          typical_weekend?: number[]
          zip?: string
        }
        Relationships: []
      }
      coaches: {
        Row: {
          about: string
          clubs: string[]
          credential: string
          discipline: string
          favorite: string
          first_name: string
          first_session: string[]
          good_for: string[]
          id: string
          name: string
          open_times: Json
          personal_trainer: boolean
          quote: string
          since: number | null
          slug: string
          specialties: string[]
          tags: string[]
          teaches: string[]
          teaches_classes: boolean
          tone: string
          years: number | null
        }
        Insert: {
          about?: string
          clubs?: string[]
          credential?: string
          discipline?: string
          favorite?: string
          first_name: string
          first_session?: string[]
          good_for?: string[]
          id: string
          name: string
          open_times?: Json
          personal_trainer?: boolean
          quote?: string
          since?: number | null
          slug: string
          specialties?: string[]
          tags?: string[]
          teaches?: string[]
          teaches_classes?: boolean
          tone?: string
          years?: number | null
        }
        Update: {
          about?: string
          clubs?: string[]
          credential?: string
          discipline?: string
          favorite?: string
          first_name?: string
          first_session?: string[]
          good_for?: string[]
          id?: string
          name?: string
          open_times?: Json
          personal_trainer?: boolean
          quote?: string
          since?: number | null
          slug?: string
          specialties?: string[]
          tags?: string[]
          teaches?: string[]
          teaches_classes?: boolean
          tone?: string
          years?: number | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          club_slug: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          message: string
          topic: string
        }
        Insert: {
          club_slug?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          message: string
          topic?: string
        }
        Update: {
          club_slug?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          message?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_club_slug_fkey"
            columns: ["club_slug"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["slug"]
          },
        ]
      }
      email_signups: {
        Row: {
          created_at: string
          details: Json
          email: string
          id: string
          source: string
        }
        Insert: {
          created_at?: string
          details?: Json
          email: string
          id?: string
          source: string
        }
        Update: {
          created_at?: string
          details?: Json
          email?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          audience: string
          group_name: string
          id: string
          question: string
          sort: number
        }
        Insert: {
          answer: string
          audience: string
          group_name?: string
          id: string
          question: string
          sort: number
        }
        Update: {
          answer?: string
          audience?: string
          group_name?: string
          id?: string
          question?: string
          sort?: number
        }
        Relationships: []
      }
      guest_passes: {
        Row: {
          bought: boolean
          club_slug: string
          contact: string
          guest_name: string
          household_id: string
          id: string
          message: string | null
          sent_at: string
          status: string
          used_on: string | null
          valid_until: string
          visit_date: string
        }
        Insert: {
          bought?: boolean
          club_slug: string
          contact: string
          guest_name: string
          household_id: string
          id: string
          message?: string | null
          sent_at: string
          status: string
          used_on?: string | null
          valid_until: string
          visit_date: string
        }
        Update: {
          bought?: boolean
          club_slug?: string
          contact?: string
          guest_name?: string
          household_id?: string
          id?: string
          message?: string | null
          sent_at?: string
          status?: string
          used_on?: string | null
          valid_until?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_passes_club_slug_fkey"
            columns: ["club_slug"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "guest_passes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          backup_card: Json | null
          billing_address: string
          billing_day: number
          billing_name: string
          cancel_on: string | null
          card: Json
          demo_clock_skew_ms: number
          demo_clock_started_at: string | null
          dismissed: Json
          freeze_window: Json | null
          guest_passes_bought: number
          home_club_changed_at: string | null
          id: string
          member_since: string
          opened: Json
          payment_failed_at: string | null
          pending_plan: Json | null
          plan_id: string
          primary_member_id: string
          pt_intro_left: number
          pt_pack: Json | null
          receipt_email: string
          remind: string[]
          seq: number
          status: string
          updated_at: string
        }
        Insert: {
          backup_card?: Json | null
          billing_address?: string
          billing_day: number
          billing_name?: string
          cancel_on?: string | null
          card: Json
          demo_clock_skew_ms?: number
          demo_clock_started_at?: string | null
          dismissed?: Json
          freeze_window?: Json | null
          guest_passes_bought?: number
          home_club_changed_at?: string | null
          id: string
          member_since: string
          opened?: Json
          payment_failed_at?: string | null
          pending_plan?: Json | null
          plan_id: string
          primary_member_id: string
          pt_intro_left?: number
          pt_pack?: Json | null
          receipt_email?: string
          remind?: string[]
          seq?: number
          status?: string
          updated_at?: string
        }
        Update: {
          backup_card?: Json | null
          billing_address?: string
          billing_day?: number
          billing_name?: string
          cancel_on?: string | null
          card?: Json
          demo_clock_skew_ms?: number
          demo_clock_started_at?: string | null
          dismissed?: Json
          freeze_window?: Json | null
          guest_passes_bought?: number
          home_club_changed_at?: string | null
          id?: string
          member_since?: string
          opened?: Json
          payment_failed_at?: string | null
          pending_plan?: Json | null
          plan_id?: string
          primary_member_id?: string
          pt_intro_left?: number
          pt_pack?: Json | null
          receipt_email?: string
          remind?: string[]
          seq?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "households_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "households_primary_member_id_fkey"
            columns: ["primary_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          description: string
          household_id: string
          id: string
          issued_at: string
          kind: string
          lines: Json
          status: string
        }
        Insert: {
          amount: number
          description: string
          household_id: string
          id: string
          issued_at: string
          kind: string
          lines?: Json
          status: string
        }
        Update: {
          amount?: number
          description?: string
          household_id?: string
          id?: string
          issued_at?: string
          kind?: string
          lines?: Json
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          club: string
          dept: string
          details: Json
          job_type: string
          pay: string
          slug: string
          sort: number
          title: string
        }
        Insert: {
          club: string
          dept: string
          details?: Json
          job_type: string
          pay?: string
          slug: string
          sort: number
          title: string
        }
        Update: {
          club?: string
          dept?: string
          details?: Json
          job_type?: string
          pay?: string
          slug?: string
          sort?: number
          title?: string
        }
        Relationships: []
      }
      join_requests: {
        Row: {
          birth_date: string | null
          club_slug: string
          created_at: string
          email: string
          family: Json
          first_name: string
          id: string
          last_name: string
          mode: string
          news_opt_in: boolean
          phone: string
          plan_id: string
          promo: string
          sms_opt_in: boolean
          zip: string
        }
        Insert: {
          birth_date?: string | null
          club_slug: string
          created_at?: string
          email: string
          family?: Json
          first_name: string
          id?: string
          last_name: string
          mode?: string
          news_opt_in?: boolean
          phone?: string
          plan_id: string
          promo?: string
          sms_opt_in?: boolean
          zip?: string
        }
        Update: {
          birth_date?: string | null
          club_slug?: string
          created_at?: string
          email?: string
          family?: Json
          first_name?: string
          id?: string
          last_name?: string
          mode?: string
          news_opt_in?: boolean
          phone?: string
          plan_id?: string
          promo?: string
          sms_opt_in?: boolean
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "join_requests_club_slug_fkey"
            columns: ["club_slug"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "join_requests_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_posts: {
        Row: {
          author_slug: string | null
          caption: string
          category: string
          class_slug: string | null
          dek: string
          published_on: string
          read_minutes: number | null
          sections: Json
          slug: string
          title: string
          tone: string
        }
        Insert: {
          author_slug?: string | null
          caption?: string
          category: string
          class_slug?: string | null
          dek?: string
          published_on: string
          read_minutes?: number | null
          sections?: Json
          slug: string
          title: string
          tone?: string
        }
        Update: {
          author_slug?: string | null
          caption?: string
          category?: string
          class_slug?: string | null
          dek?: string
          published_on?: string
          read_minutes?: number | null
          sections?: Json
          slug?: string
          title?: string
          tone?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_posts_author_slug_fkey"
            columns: ["author_slug"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["slug"]
          },
        ]
      }
      members: {
        Row: {
          allergy_notes: string | null
          auth_user_id: string | null
          dob: string
          email: string
          ends_on: string | null
          first_name: string
          home_club: string
          household_id: string
          hue: number
          id: string
          invited_at: string | null
          last_name: string
          lifetime_visits: number
          longest_streak: number
          member_number: string
          parent_id: string | null
          paused_until: string | null
          permissions: Json | null
          pickup: string[] | null
          prefs: Json
          role: string
          status: string
          streak_weeks: number
          updated_at: string
        }
        Insert: {
          allergy_notes?: string | null
          auth_user_id?: string | null
          dob: string
          email?: string
          ends_on?: string | null
          first_name: string
          home_club: string
          household_id: string
          hue?: number
          id: string
          invited_at?: string | null
          last_name: string
          lifetime_visits?: number
          longest_streak?: number
          member_number: string
          parent_id?: string | null
          paused_until?: string | null
          permissions?: Json | null
          pickup?: string[] | null
          prefs?: Json
          role: string
          status?: string
          streak_weeks?: number
          updated_at?: string
        }
        Update: {
          allergy_notes?: string | null
          auth_user_id?: string | null
          dob?: string
          email?: string
          ends_on?: string | null
          first_name?: string
          home_club?: string
          household_id?: string
          hue?: number
          id?: string
          invited_at?: string | null
          last_name?: string
          lifetime_visits?: number
          longest_streak?: number
          member_number?: string
          parent_id?: string | null
          paused_until?: string | null
          permissions?: Json | null
          pickup?: string[] | null
          prefs?: Json
          role?: string
          status?: string
          streak_weeks?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_home_club_fkey"
            columns: ["home_club"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          household_id: string
          id: string
          member_id: string
          messages: Json
          subject: string
          with_name: string
        }
        Insert: {
          household_id: string
          id: string
          member_id: string
          messages?: Json
          subject: string
          with_name: string
        }
        Update: {
          household_id?: string
          id?: string
          member_id?: string
          messages?: Json
          subject?: string
          with_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          action_label: string | null
          at: string
          body: string
          booking_id: string | null
          done: string | null
          filter: string
          household_id: string
          id: string
          member_id: string
          needs_action: boolean
          read_at: string | null
          request_id: string | null
          thread_id: string | null
          title: string
          type: string
        }
        Insert: {
          action_label?: string | null
          at: string
          body?: string
          booking_id?: string | null
          done?: string | null
          filter: string
          household_id: string
          id: string
          member_id: string
          needs_action?: boolean
          read_at?: string | null
          request_id?: string | null
          thread_id?: string | null
          title: string
          type: string
        }
        Update: {
          action_label?: string | null
          at?: string
          body?: string
          booking_id?: string | null
          done?: string | null
          filter?: string
          household_id?: string
          id?: string
          member_id?: string
          needs_action?: boolean
          read_at?: string | null
          request_id?: string | null
          thread_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notices_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_comparison: {
        Row: {
          ridge: string
          row_label: string
          sort: number
          summit: string
          trailhead: string
        }
        Insert: {
          ridge: string
          row_label: string
          sort: number
          summit: string
          trailhead: string
        }
        Update: {
          ridge?: string
          row_label?: string
          sort?: number
          summit?: string
          trailhead?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          badge: string | null
          best_for: string
          blurb: string
          booking_window_days: number
          compact: string[]
          features: string[]
          guest_passes: number
          id: string
          name: string
          perks: string[]
          price: number
          ribs: number
          sort: number
        }
        Insert: {
          badge?: string | null
          best_for?: string
          blurb?: string
          booking_window_days: number
          compact?: string[]
          features?: string[]
          guest_passes?: number
          id: string
          name: string
          perks?: string[]
          price: number
          ribs?: number
          sort: number
        }
        Update: {
          badge?: string | null
          best_for?: string
          blurb?: string
          booking_window_days?: number
          compact?: string[]
          features?: string[]
          guest_passes?: number
          id?: string
          name?: string
          perks?: string[]
          price?: number
          ribs?: number
          sort?: number
        }
        Relationships: []
      }
      price_constants: {
        Row: {
          amount: number
          key: string
          label: string
        }
        Insert: {
          amount: number
          key: string
          label: string
        }
        Update: {
          amount?: number
          key?: string
          label?: string
        }
        Relationships: []
      }
      pt_packs: {
        Row: {
          price: number
          sessions: number
        }
        Insert: {
          price: number
          sessions: number
        }
        Update: {
          price?: number
          sessions?: number
        }
        Relationships: []
      }
      site_content: {
        Row: {
          data: Json
          key: string
        }
        Insert: {
          data: Json
          key: string
        }
        Update: {
          data?: Json
          key?: string
        }
        Relationships: []
      }
      strikes: {
        Row: {
          at: string
          booking_id: string | null
          household_id: string
          id: string
          member_id: string
          title: string
        }
        Insert: {
          at: string
          booking_id?: string | null
          household_id: string
          id: string
          member_id: string
          title: string
        }
        Update: {
          at?: string
          booking_id?: string | null
          household_id?: string
          id?: string
          member_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "strikes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strikes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      teen_requests: {
        Row: {
          at: string
          expires_at: string
          household_id: string
          id: string
          note: string | null
          parent_id: string
          session_id: string | null
          status: string
          teen_id: string
          title: string
        }
        Insert: {
          at: string
          expires_at: string
          household_id: string
          id: string
          note?: string | null
          parent_id: string
          session_id?: string | null
          status: string
          teen_id: string
          title: string
        }
        Update: {
          at?: string
          expires_at?: string
          household_id?: string
          id?: string
          note?: string | null
          parent_id?: string
          session_id?: string | null
          status?: string
          teen_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "teen_requests_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teen_requests_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teen_requests_teen_id_fkey"
            columns: ["teen_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_requests: {
        Row: {
          club_slug: string
          contact: string
          created_at: string
          first_name: string
          id: string
          note: string | null
          ref: string
          remind: boolean
          slot_at: string
          with_coach: string | null
        }
        Insert: {
          club_slug: string
          contact: string
          created_at?: string
          first_name: string
          id?: string
          note?: string | null
          ref: string
          remind?: boolean
          slot_at: string
          with_coach?: string | null
        }
        Update: {
          club_slug?: string
          contact?: string
          created_at?: string
          first_name?: string
          id?: string
          note?: string | null
          ref?: string
          remind?: boolean
          slot_at?: string
          with_coach?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tour_requests_club_slug_fkey"
            columns: ["club_slug"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["slug"]
          },
        ]
      }
      trial_passes: {
        Row: {
          club_slug: string
          code: string
          contact: string
          created_at: string
          first_name: string
          id: string
          remind: boolean
        }
        Insert: {
          club_slug: string
          code: string
          contact: string
          created_at?: string
          first_name: string
          id?: string
          remind?: boolean
        }
        Update: {
          club_slug?: string
          code?: string
          contact?: string
          created_at?: string
          first_name?: string
          id?: string
          remind?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "trial_passes_club_slug_fkey"
            columns: ["club_slug"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["slug"]
          },
        ]
      }
      visits: {
        Row: {
          at: string
          category_id: string | null
          club_slug: string
          household_id: string
          id: number
          member_id: string
        }
        Insert: {
          at: string
          category_id?: string | null
          club_slug: string
          household_id: string
          id?: number
          member_id: string
        }
        Update: {
          at?: string
          category_id?: string | null
          club_slug?: string
          household_id?: string
          id?: number
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_club_slug_fkey"
            columns: ["club_slug"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "visits_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      demo_clock: {
        Args: never
        Returns: {
          server_now: string
          skew_ms: number
          started_at: string
        }[]
      }
      reset_demo_household: { Args: never; Returns: undefined }
      session_counts: {
        Args: { p_from: string; p_to: string }
        Returns: {
          booked: number
          session_id: string
          waitlisted: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
