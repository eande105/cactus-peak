import Foundation
@testable import CactusPeak

/// Rows shaped exactly as PostgREST returns them (snake_case keys, ISO timestamps), so the tests cover decoding too.
enum Fixtures {
    static let clubsJSON = """
    [{"slug":"mesa-dobson","sort":0,"legacy_id":"c1","name":"Mesa – Dobson","short_name":"Dobson","city":"Mesa","neighborhood":"Dobson",
      "cross_streets":"","address":"Dobson Rd & Southern Ave, Mesa","zip":"85202","phone":"(480) 555-0114","club_type":"Flagship",
      "type_label":"Flagship · 68,000 sq ft","sqft":68000,"personality":"The big one.","lat":33.384,"lng":-111.874,"photo_caption":"",
      "amenities":["25-yd lap pool, 8 lanes","4 pickleball courts","Kids club"],
      "pool":{"unit":"yd","label":"25-yard lap pool","lanes":8,"therapy":true},
      "courts":[{"count":4,"sport":"pickleball"},{"count":2,"sport":"tennis"}],"kids_club":true,"recovery":"suite",
      "studios":["Studio A"],"studio_count":3,"typical_weekday":[1,2,3,4,3,3,3,2,3,2,2,3,4,5,4,3,2,1],
      "typical_weekend":[1,1,2,3,4,4,4,3,3,2,2,2,2,2,2,1,1,1],"demo_miles":11.3}]
    """
    static let coachesJSON = """
    [{"id":"jamal","slug":"jamal-carter","name":"Jamal Carter","first_name":"Jamal","discipline":"Cycle","credential":"","clubs":["mesa-dobson"],
      "teaches_classes":true,"personal_trainer":false,"specialties":[],"teaches":[],"about":"","open_times":[]},
     {"id":"sam","slug":"sam-okafor","name":"Sam Okafor","first_name":"Sam","discipline":"","credential":"NASM-CPT","clubs":["mesa-dobson"],
      "teaches_classes":false,"personal_trainer":true,"specialties":["Strength"],"teaches":["teen-strength"],"about":"Hi.",
      "open_times":[{"dow":2,"time":"09:30"}]}]
    """
    static let typesJSON = """
    [{"key":"cc","slug":"climb-cycle","sort":0,"name":"Climb Cycle","category_id":"cycle","duration":45,"intensity":4,"intensity_min":3,
      "intensity_max":5,"capacity":20,"unit":"bikes","first_timer_ok":true,"teen_ok":true,"min_age":13,"bookable":true,"about":"About",
      "blurb":"Hills.","bring":["Water"],"club_slugs":null},
     {"key":"ts","slug":"teen-strength","sort":1,"name":"Teen Strength","category_id":"youth","duration":60,"intensity":3,"intensity_min":2,
      "intensity_max":4,"capacity":12,"unit":"spots","first_timer_ok":true,"teen_ok":true,"min_age":13,"bookable":true,"about":"","blurb":"",
      "bring":[],"club_slugs":["mesa-dobson"]},
     {"key":"dfy","slug":"desert-flow-yoga","sort":2,"name":"Desert Flow Yoga","category_id":"mind-body","duration":60,"intensity":2,
      "intensity_min":1,"intensity_max":3,"capacity":20,"unit":"mats","first_timer_ok":true,"teen_ok":true,"min_age":13,"bookable":true,
      "about":"","blurb":"Slow.","bring":[],"club_slugs":null},
     {"key":"lap-swim","slug":"lap-swim","sort":3,"name":"Lap Swim","category_id":"aqua","duration":45,"intensity":4,"intensity_min":1,
      "intensity_max":5,"capacity":2,"unit":"lanes","first_timer_ok":true,"teen_ok":false,"min_age":0,"bookable":false,"about":"","blurb":"",
      "bring":[],"club_slugs":null}]
    """
    static let schedulesJSON = """
    [{"id":90,"club_slug":"mesa-dobson","class_key":"cc","start_time":"06:00:00","days":[1,2,3,4,5],"studio":"Cycle Studio","coach_id":"jamal","intensity":null},
     {"id":91,"club_slug":"mesa-dobson","class_key":"dfy","start_time":"09:00:00","days":[0],"studio":"Studio A","coach_id":"jamal","intensity":1},
     {"id":92,"club_slug":"mesa-dobson","class_key":"lap-swim","start_time":"07:00:00","days":[2],"studio":"Pool","coach_id":"jamal","intensity":null}]
    """

    static func decode<T: Decodable>(_ json: String, as: T.Type) -> T {
        try! RowCoding.decoder.decode(T.self, from: Data(json.utf8))
    }

    static var catalog: CatalogRows {
        CatalogRows(clubs: decode(clubsJSON, as: [ClubRow].self), categories: [], coaches: decode(coachesJSON, as: [CoachRow].self),
                    classTypes: decode(typesJSON, as: [ClassTypeRow].self), schedules: decode(schedulesJSON, as: [ScheduleRow].self))
    }

    static let householdJSON = """
    {"id":"h3","primary_member_id":"daniel","plan_id":"trailhead","billing_day":14,"member_since":"2026-09-14T07:00:00+00:00",
     "status":"active","freeze_window":null,"cancel_on":null,"pending_plan":null,"payment_failed_at":null,"pt_pack":{"total":4,"used":1,"expiresOn":1819000000000},
     "pt_intro_left":0,"home_club_changed_at":null,"card":{"brand":"visa","last4":"1189","expMonth":8,"expYear":28}}
    """
    static let membersJSON = """
    [{"id":"daniel","household_id":"h3","auth_user_id":"6f1c2a0e-1111-4c2b-9b1a-000000000001","role":"primary","first_name":"Daniel",
      "last_name":"Whitaker","dob":"1974-07-09","email":"daniel@example.com","member_number":"CP-002-440-871","home_club":"mesa-dobson",
      "parent_id":null,"allergy_notes":null,"status":"active","permissions":null,"paused_until":null,"streak_weeks":1,"lifetime_visits":6,
      "longest_streak":1,"prefs":{"weeklyTarget":4,"interests":["recovery","mind-body"],"reminderMin":60,"onboardingStep":3}},
     {"id":"kid1","household_id":"h3","auth_user_id":null,"role":"child","first_name":"Theo","last_name":"Whitaker","dob":"2019-02-01",
      "email":"","member_number":"CP-1","home_club":"mesa-dobson","parent_id":"daniel","allergy_notes":"Peanuts","status":"active",
      "permissions":null,"paused_until":null,"streak_weeks":0,"lifetime_visits":0,"longest_streak":0,"prefs":{}},
     {"id":"kid2","household_id":"h3","auth_user_id":null,"role":"child","first_name":"Ivy","last_name":"Whitaker","dob":"2021-02-01",
      "email":"","member_number":"CP-2","home_club":"mesa-dobson","parent_id":"daniel","allergy_notes":null,"status":"active",
      "permissions":null,"paused_until":null,"streak_weeks":0,"lifetime_visits":0,"longest_streak":0,"prefs":{}}]
    """
    static func booking(_ id: String, kind: String = "class", member: String = "daniel", status: String = "booked", ref: String = "CP-1",
                        start: String = "2026-10-28T16:00:00+00:00", session: String? = "mesa-dobson~2026-10-28~0900~af") -> String {
        """
        {"id":"\(id)","household_id":"h3","kind":"\(kind)","member_id":"\(member)","owner_id":"daniel","status":"\(status)","ref":"\(ref)",
         "club_slug":"mesa-dobson","starts_at":"\(start)","ends_at":"2026-10-28T16:45:00.123+00:00","title":"Aqua Fit",
         "category_id":"aqua","place":"Pool","session_id":\(session.map { "\"\($0)\"" } ?? "null"),"spot":null,"waitlist_position":null,
         "hold_expires_at":null,"resource":\(kind == "lane" ? "\"Lane 3\"" : "null"),"sport":null,"players":null,"children":null,
         "coach_slug":null,"payment":null,"feedback_done":false,"cancelled_at":null,"no_strike":false,
         "created_at":"2026-10-26T12:40:00+00:00","updated_at":"2026-10-30T00:15:29.171239+00:00"}
        """
    }

    static func household(bookings: [String]) -> HouseholdRows {
        HouseholdRows(userId: UUID(uuidString: "6f1c2a0e-1111-4c2b-9b1a-000000000001")!, memberId: "daniel",
                      household: decode(householdJSON, as: HouseholdRow.self), members: decode(membersJSON, as: [MemberRow].self),
                      bookings: decode("[\(bookings.joined(separator: ","))]", as: [BookingDBRow].self),
                      strikes: [], notices: decode("""
                      [{"id":"n10","household_id":"h3","member_id":"daniel","type":"coach","title":"Welcome","body":"Hi","at":"2026-10-25T12:40:00+00:00",
                        "read_at":null,"needs_action":false,"action_label":null,"booking_id":null,"request_id":null,"thread_id":null,"filter":"news","done":null}]
                      """, as: [NoticeRow].self),
                      guestPasses: [], visits: [], invoices: [])
    }

    /// A model with no backend and an empty temporary cache. Writes stay local.
    @MainActor static func model() -> AppModel {
        let dir = FileManager.default.temporaryDirectory.appendingPathComponent(UUID().uuidString)
        let m = AppModel(cache: LocalCache(directory: dir), client: nil)
        m.frozenClock = true
        m.applyCatalog(catalog, savedAt: Date())
        return m
    }
}
