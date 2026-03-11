![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue)
![AI Agent Ready](https://img.shields.io/badge/AI-Agent%20Ready-green)

# UK Parliament Committees MCP Server

# Summary
This MCP server provides structured access to UK Parliament Committees data using the Model Context Protocol.
It enables AI agents to query committees, committee business, events, publications, evidence, and petitions via API-backed tools and data access.
Developers can connect the MCP server through stdio transport for reliable automation and AI agents that need authoritative committee information.
The server exposes tools that map directly to the Committees API, supporting search, lookup, and document retrieval workflows.

## Features
- Retrieve committees, committee types, and committee business with structured filters.
- Access meetings, events, activities, and attendance data with date and status parameters.
- Fetch publications, evidence, petitions, and related documents with consistent responses.
- Preserve upstream payloads in a standardized envelope for downstream tools and AI agents.

## Available Tools
### get_bill_petitions
Return a list of Bill petitions.

Parameters:
- CommitteeBusinessId (number, query) – Committee business id filter.
- CommitteeId (number, query) – Committee id filter.
- SearchTerm (string, query) – Search by witness/organisation/identifier.
- StartDate (string, query) – Published on or after date.
- EndDate (string, query) – Published on or before date.
- ShowOnWebsiteOnly (boolean, query) – Website-only results.
- Skip (number, query) – Offset.
- Take (number, query) – Limit.

### get_bill_petition_by_id
Return a Bill petition.

Parameters:
- id (number, path) – Bill petition id.
- showOnWebsiteOnly (boolean, query) – Website-only results.

### get_bill_petition_document
Return a document for a Bill petition.

Parameters:
- id (number, path) – Petition id.
- fileDataFormat (string, path) – OriginalFormat | Html | Pdf.

### get
Get a list of Committee Meetings between two dates.

Parameters:
- FromDate (string, query) – From date (yyyy-mm-dd).
- ToDate (string, query) – To date (yyyy-mm-dd).

### get_committee_business
Return a list of committee businesses.

Parameters:
- SearchTerm (string, query)
- CommitteeId (number, query)
- DateFrom (string, query)
- DateTo (string, query)
- BusinessTypeId (number, query)
- Status (string, query) – Open | Closed
- CurrentlyAcceptingPetitions (boolean, query)
- CurrentlyAcceptingEvidence (boolean, query)
- SortOrder (string, query) – DateOpenedNewest | DateOpenedOldest | PublicationDateAscending | PublicationDateDescending
- CommitteeBusinessIds (array:number, query)
- ShowOnWebsiteOnly (boolean, query)
- Skip (number, query)
- Take (number, query)

### get_committee_business_by_id
Return a committee business.

Parameters:
- id (number, path) – Committee business id.
- includeBanners (boolean, query)
- showOnWebsiteOnly (boolean, query)

### list_committee_business_publication_groups
Return a list of Publication Groups for a Committee Business.

Parameters:
- id (number, path) – Committee business id.

### list_committee_business_types
Return a list of Committee Business Types.

### list_committee_types
Return a list of Committee Types.

### get_committees
Return a list of Committees.

Parameters:
- CommitteeBusinessId (number, query)
- SearchTerm (string, query)
- ParentCommitteeId (number, query)
- CommitteeStatus (string, query) – Current | Former | All
- CommitteeTypeId (number, query)
- CommitteeCategory (string, query) – Select | General | Other
- House (string, query) – Commons | Lords | Joint
- CommitteeIds (array:number, query)
- ShowOnWebsiteOnly (boolean, query)
- Skip (number, query)
- Take (number, query)

### get_next_event_for_committees
Return a list of next events for committees matching specified criteria.

Parameters:
- EventWithActivitiesOnly (boolean, query)
- EventFromDate (string, query)
- House (string, query) – Commons | Lords | Joint
- EventTypes (array:number, query)
- ShowOnWebsiteOnly (boolean, query)
- Skip (number, query)
- Take (number, query)

### get_committee_by_id
Return a Committee.

Parameters:
- id (number, path) – Committee id.
- includeBanners (boolean, query)
- showOnWebsiteOnly (boolean, query)

### get_events_committee_by_id
Return events related to the committee id provided.

Parameters:
- id (number, path) – Committee id.
- CommitteeBusinessId (number, query)
- SearchTerm (string, query)
- StartDateFrom (string, query)
- StartDateTo (string, query)
- EndDateFrom (string, query)
- House (string, query) – Commons | Lords | Joint
- LocationId (number, query)
- ExcludeCancelledEvents (boolean, query)
- SortAscending (boolean, query)
- EventTypeId (number, query)
- IncludeEventAttendees (boolean, query)
- ShowOnWebsiteOnly (boolean, query)
- Skip (number, query)
- Take (number, query)

### list_committee_memberships
Return a list of Memberships of a Committee.

Parameters:
- id (number, path) – Committee id.
- MembershipStatus (string, query) – Current | Former | All
- ShowOnWebsiteOnly (boolean, query)
- Skip (number, query)
- Take (number, query)

### get_committee_person_photo
Return photo for a lay member of the committee.

Parameters:
- id (number, path) – Committee id.
- personId (number, path) – Person id.

### list_committee_staff_memberships
Return a list of staff members of a Committee.

Parameters:
- id (number, path) – Committee id.
- MembershipStatus (string, query) – Current | Former | All
- ShowOnWebsiteOnly (boolean, query)
- Skip (number, query)
- Take (number, query)

### list_committee_publication_groups
Return a list of Publication Groups for a Committee.

Parameters:
- id (number, path) – Committee id.

### get_committee_archived_publication_links
Return all CommitteeArchivedPublicationLinks linked to a Committee.

Parameters:
- id (number, path) – Committee id.

### get_countries
Return a list of Countries.

### get_events
Return a list of events.

Parameters:
- CommitteeId (number, query)
- CommitteeBusinessId (number, query)
- GroupChildEventsWithParent (boolean, query)
- SearchTerm (string, query)
- StartDateFrom (string, query)
- StartDateTo (string, query)
- EndDateFrom (string, query)
- House (string, query) – Commons | Lords | Joint
- LocationId (number, query)
- ExcludeCancelledEvents (boolean, query)
- SortAscending (boolean, query)
- EventTypeId (number, query)
- IncludeEventAttendees (boolean, query)
- ShowOnWebsiteOnly (boolean, query)
- Skip (number, query)
- Take (number, query)

### get_event_activities
Return a list of event activities.

Parameters:
- IncludeActivityAttendees (boolean, query)
- CommitteeId (number, query)
- CommitteeBusinessId (number, query)
- GroupChildEventsWithParent (boolean, query)
- SearchTerm (string, query)
- StartDateFrom (string, query)
- StartDateTo (string, query)
- EndDateFrom (string, query)
- House (string, query) – Commons | Lords | Joint
- LocationId (number, query)
- ExcludeCancelledEvents (boolean, query)
- SortAscending (boolean, query)
- EventTypeId (number, query)
- IncludeEventAttendees (boolean, query)
- ShowOnWebsiteOnly (boolean, query)
- Skip (number, query)
- Take (number, query)

### get_event_by_id
Return an event.

Parameters:
- id (number, path) – Event id.
- showOnWebsiteOnly (boolean, query)

### get_attendances_by_id
Return a list of attendances for an event.

Parameters:
- id (number, path) – Event id.
- showOnWebsiteOnly (boolean, query)

### get_activities_by_id
Return a list of activities for an event.

Parameters:
- id (number, path) – Event id.
- showOnWebsiteOnly (boolean, query)

### list_members_committee_memberships
Return a list of memberships for one or more members.

Parameters:
- Members (array:number, query) – Member ids.
- MembershipStatus (string, query) – Current | Former | All
- CommitteeCategory (string, query) – Select | General | Other
- ShowOnWebsiteOnly (boolean, query)

### banners
Return messaging banners.

Parameters:
- location (string, path) – Banner location.

### get_oral_evidence
Return a list of Oral Evidence.

Parameters:
- CommitteeBusinessId (number, query)
- CommitteeId (number, query)
- SearchTerm (string, query)
- StartDate (string, query)
- EndDate (string, query)
- ShowOnWebsiteOnly (boolean, query)
- Skip (number, query)
- Take (number, query)

### get_oral_evidence_by_id
Return an Oral Evidence.

Parameters:
- id (number, path) – Oral evidence id.
- showOnWebsiteOnly (boolean, query)

### get_oral_evidence_document
Return a document for an Oral Evidence.

Parameters:
- id (number, path) – Oral evidence id.
- fileDataFormat (string, path) – OriginalFormat | Html | Pdf.

### list_publication_types
Return a list of Publication Types.

### get_publications
Return a list of publications.

Parameters:
- PublicationTypeIds (array:number, query)
- SearchTerm (string, query)
- StartDate (string, query)
- EndDate (string, query)
- SortOrder (string, query) – PublicationDateDescending | PublicationDateAscending | ResponseDateDescending | ResponseDateAscending
- PaperNumbers (array:string, query)
- CommitteeBusinessId (number, query)
- CommitteeId (number, query)
- ShowOnWebsiteOnly (boolean, query)
- Skip (number, query)
- Take (number, query)

### get_publication_by_id
Return a publication.

Parameters:
- id (number, path) – Publication id.
- showOnWebsiteOnly (boolean, query)

### get_document
Return a document for a publication.

Parameters:
- id (number, path) – Publication id.
- documentId (number, path) – Document id.
- fileDataFormat (string, path) – OriginalFormat | Html | Pdf.

### get_submission_period_template_document_by_id
Return a submission period template file.

Parameters:
- id (number, path) – Submission period template id.
- documentId (number, path) – Document id.

### get_submission_period_by_id
Return a submission period.

Parameters:
- id (number, path) – Submission period id.

### get_written_evidence
Return a list of Written Evidence.

Parameters:
- CommitteeBusinessId (number, query)
- CommitteeId (number, query)
- SearchTerm (string, query)
- StartDate (string, query)
- EndDate (string, query)
- ShowOnWebsiteOnly (boolean, query)
- Skip (number, query)
- Take (number, query)

### get_written_evidence_by_id
Return a Written Evidence.

Parameters:
- id (number, path) – Written evidence id.
- showOnWebsiteOnly (boolean, query)

### get_written_evidence_document
Return a document for a Written Evidence.

Parameters:
- id (number, path) – Written evidence id.
- fileDataFormat (string, path) – OriginalFormat | Html | Pdf.

## Example Output
```json
{
  "status": 200,
  "data": {
    "items": [
      {
        "committeeId": 123,
        "name": "Select Committee on Energy",
        "house": "Commons",
        "status": "Current"
      }
    ],
    "totalResults": 1
  },
  "upstream_path": "/api/Committees",
  "retrieved_at": "2026-03-11T10:00:00.000Z"
}
```

## Quick Start
Run the MCP server using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-committees mcp-server-uk-parliament-committees
```

## MCP Configuration
Example `mcpServers` configuration for stdio transport:

```json
{
  "mcpServers": {
    "uk-parliament-committees": {
      "command": "npx",
      "args": ["-y", "-p", "@darkhorseone/mcp-server-uk-parliament-committees", "mcp-server-uk-parliament-committees"],
      "env": {
        "UKPCOM_API_BASE_URL": "https://committees-api.parliament.uk",
        "UKPCOM_REQUEST_TIMEOUT_MS": "10000"
      }
    }
  }
}
```

## Example Usage
- List current committees in the House of Commons.
- Find committee business by keyword and filter by status.
- Retrieve events for a committee within a date range.
- Download a committee publication document as PDF.

## Use Cases
- AI agents summarizing committee activity and upcoming meetings.
- Research tools tracking evidence submissions and publications.
- Civic technology platforms monitoring committee business statuses.
- Automation systems enriching datasets with committee metadata.

## Data Source
UK Parliament Committees API
https://committees-api.parliament.uk/index.html

## Installation
Run directly using npx:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-committees mcp-server-uk-parliament-committees
```

Or install via pnpm from the repository root:

```bash
pnpm install
```

## Run (HTTP proxy server)
Build first, then start:

```bash
pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees run build
pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees run start:http
```

Set a custom HTTP port with the `UKPCOM_HTTP_PORT` environment variable (default: `8787`):

```bash
UKPCOM_HTTP_PORT=8787 pnpm --filter @darkhorseone/mcp-server-uk-parliament-committees run start:http
```

Published package command:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-committees -- mcp-server-uk-parliament-committees-http
```

If your shell cannot resolve the bin ("command not found"), run the HTTP entrypoint directly:

```bash
npx -y -p @darkhorseone/mcp-server-uk-parliament-committees -- node ./dist/http.js
```

Health check:

```bash
curl http://127.0.0.1:8787/healthz
```

Proxy pattern:

```text
GET /proxy/<upstream-path>?<query>
```

Example:

```bash
curl "http://127.0.0.1:8787/proxy/api/Committees?Take=5"
```

## License
MIT License

## MCP Metadata
Protocol: Model Context Protocol
Transport: stdio
Tools: get_bill_petitions, get_bill_petition_by_id, get_bill_petition_document, get, get_committee_business, get_committee_business_by_id, list_committee_business_publication_groups, list_committee_business_types, list_committee_types, get_committees, get_next_event_for_committees, get_committee_by_id, get_events_committee_by_id, list_committee_memberships, get_committee_person_photo, list_committee_staff_memberships, list_committee_publication_groups, get_committee_archived_publication_links, get_countries, get_events, get_event_activities, get_event_by_id, get_attendances_by_id, get_activities_by_id, list_members_committee_memberships, banners, get_oral_evidence, get_oral_evidence_by_id, get_oral_evidence_document, list_publication_types, get_publications, get_publication_by_id, get_document, get_submission_period_template_document_by_id, get_submission_period_by_id, get_written_evidence, get_written_evidence_by_id, get_written_evidence_document
