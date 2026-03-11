export type ParameterType = 'string' | 'number' | 'boolean' | 'array:string' | 'array:number';

export interface EndpointParameter {
  name: string;
  in: 'path' | 'query';
  required: boolean;
  type: ParameterType;
  description?: string;
  enum?: Array<string | number | boolean>;
}

export interface EndpointDefinition {
  path: string;
  method: 'GET';
  toolName: string;
  summary: string;
  pathParams: EndpointParameter[];
  queryParams: EndpointParameter[];
}

export const ENDPOINTS: EndpointDefinition[] = [
  {
    "path": "/api/BillPetitions",
    "method": "GET",
    "toolName": "get_bill_petitions",
    "summary": "Return a list of Bill petitions",
    "pathParams": [],
    "queryParams": [
      {
        "name": "CommitteeBusinessId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of evidence related to a committee business with the committee business id"
      },
      {
        "name": "CommitteeId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of evidence related to a committee with the committee id"
      },
      {
        "name": "SearchTerm",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "Search by witness names, organisation names, and submission identifiers (where applicable). Must be 2 characters or more."
      },
      {
        "name": "StartDate",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of evidence published on or after date provided"
      },
      {
        "name": "EndDate",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of evidence published on or before date provided"
      },
      {
        "name": "ShowOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      },
      {
        "name": "Skip",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Numbers of items to skip - defaults to 0"
      },
      {
        "name": "Take",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Number of items to be returned - defaults to 30"
      }
    ]
  },
  {
    "path": "/api/BillPetitions/{id}",
    "method": "GET",
    "toolName": "get_bill_petition_by_id",
    "summary": "Return a Bill petition",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Bill petition with ID specified"
      }
    ],
    "queryParams": [
      {
        "name": "showOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      }
    ]
  },
  {
    "path": "/api/BillPetitions/{id}/Document/{fileDataFormat}",
    "method": "GET",
    "toolName": "get_bill_petition_document",
    "summary": "Return a document for a Bill petition",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Petition Id of the document return"
      },
      {
        "name": "fileDataFormat",
        "in": "path",
        "required": true,
        "type": "string",
        "description": "Type of file to return",
        "enum": [
          "OriginalFormat",
          "Html",
          "Pdf"
        ]
      }
    ],
    "queryParams": []
  },
  {
    "path": "/api/Broadcast/Meetings",
    "method": "GET",
    "toolName": "get",
    "summary": "Get a list of Committee Meetings between two dates.",
    "pathParams": [],
    "queryParams": [
      {
        "name": "FromDate",
        "in": "query",
        "required": true,
        "type": "string",
        "description": "Get meetings from and including this date, format 'yyyy-mm-dd'."
      },
      {
        "name": "ToDate",
        "in": "query",
        "required": true,
        "type": "string",
        "description": "Get meetings up to and including this date, format 'yyyy-mm-dd'."
      }
    ]
  },
  {
    "path": "/api/CommitteeBusiness",
    "method": "GET",
    "toolName": "get_committee_business",
    "summary": "Return a list of committee businesses",
    "pathParams": [],
    "queryParams": [
      {
        "name": "SearchTerm",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "Search by committee business name. Must be 2 characters or more."
      },
      {
        "name": "CommitteeId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Id for the related committee"
      },
      {
        "name": "DateFrom",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of committee business starting on or after date provided"
      },
      {
        "name": "DateTo",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of committee business opened on or before date provided"
      },
      {
        "name": "BusinessTypeId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Id for committee business type"
      },
      {
        "name": "Status",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of committees business by status",
        "enum": [
          "Open",
          "Closed"
        ]
      },
      {
        "name": "CurrentlyAcceptingPetitions",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Limit to committee businesses that are currently accepting hybrid or private bill petitions"
      },
      {
        "name": "CurrentlyAcceptingEvidence",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Limit to committee businesses that are currently accepting written evidence submissions"
      },
      {
        "name": "SortOrder",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List committee business by specified sort order",
        "enum": [
          "DateOpenedNewest",
          "DateOpenedOldest",
          "PublicationDateAscending",
          "PublicationDateDescending"
        ]
      },
      {
        "name": "CommitteeBusinessIds",
        "in": "query",
        "required": false,
        "type": "array:number",
        "description": "List of committee businesses by Ids"
      },
      {
        "name": "ShowOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      },
      {
        "name": "Skip",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Numbers of items to skip - defaults to 0"
      },
      {
        "name": "Take",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Number of items to be returned - defaults to 30"
      }
    ]
  },
  {
    "path": "/api/CommitteeBusiness/{id}",
    "method": "GET",
    "toolName": "get_committee_business_by_id",
    "summary": "Return a committee business",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Committee business Id to return"
      }
    ],
    "queryParams": [
      {
        "name": "includeBanners",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Include banner image file in result - defaults to false"
      },
      {
        "name": "showOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      }
    ]
  },
  {
    "path": "/api/CommitteeBusiness/{id}/Publications/Summary",
    "method": "GET",
    "toolName": "list_committee_business_publication_groups",
    "summary": "Return a list of Publication Groups for a Commitee Business",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "The committee business id"
      }
    ],
    "queryParams": []
  },
  {
    "path": "/api/CommitteeBusinessType",
    "method": "GET",
    "toolName": "list_committee_business_types",
    "summary": "Return a list of Committee Business Types",
    "pathParams": [],
    "queryParams": []
  },
  {
    "path": "/api/CommitteeType",
    "method": "GET",
    "toolName": "list_committee_types",
    "summary": "Return a list of Committee Types",
    "pathParams": [],
    "queryParams": []
  },
  {
    "path": "/api/Committees",
    "method": "GET",
    "toolName": "get_committees",
    "summary": "Return a list of Committees",
    "pathParams": [],
    "queryParams": [
      {
        "name": "CommitteeBusinessId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of committees by committee business"
      },
      {
        "name": "SearchTerm",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "Search by committee name. Performs a full text search across committee names (including historic), as well as any metadata configured for the committee."
      },
      {
        "name": "ParentCommitteeId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of committees by child committees of a parent"
      },
      {
        "name": "CommitteeStatus",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of committees by status - defaults to current",
        "enum": [
          "Current",
          "Former",
          "All"
        ]
      },
      {
        "name": "CommitteeTypeId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of committees by the type"
      },
      {
        "name": "CommitteeCategory",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of committees by category",
        "enum": [
          "Select",
          "General",
          "Other"
        ]
      },
      {
        "name": "House",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of committees by House",
        "enum": [
          "Commons",
          "Lords",
          "Joint"
        ]
      },
      {
        "name": "CommitteeIds",
        "in": "query",
        "required": false,
        "type": "array:number",
        "description": "List of committees by Ids"
      },
      {
        "name": "ShowOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      },
      {
        "name": "Skip",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Numbers of items to skip - defaults to 0"
      },
      {
        "name": "Take",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Number of items to be returned - defaults to 30"
      }
    ]
  },
  {
    "path": "/api/Committees/NextEvent",
    "method": "GET",
    "toolName": "get_next_event_for_committees",
    "summary": "Return a list of next events for committees matching specified criteria",
    "pathParams": [],
    "queryParams": [
      {
        "name": "EventWithActivitiesOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only returns events with valid activities - defaults to false"
      },
      {
        "name": "EventFromDate",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "Date from which upcoming event is to be calculated"
      },
      {
        "name": "House",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "House of committee",
        "enum": [
          "Commons",
          "Lords",
          "Joint"
        ]
      },
      {
        "name": "EventTypes",
        "in": "query",
        "required": false,
        "type": "array:number",
        "description": "List of event activities with the specified event type"
      },
      {
        "name": "ShowOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      },
      {
        "name": "Skip",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Numbers of items to skip - defaults to 0"
      },
      {
        "name": "Take",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Number of items to be returned - defaults to 30"
      }
    ]
  },
  {
    "path": "/api/Committees/{id}",
    "method": "GET",
    "toolName": "get_committee_by_id",
    "summary": "Return a Committee",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Committee with ID specified"
      }
    ],
    "queryParams": [
      {
        "name": "includeBanners",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Include banner image file in result - defaults to false"
      },
      {
        "name": "showOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      }
    ]
  },
  {
    "path": "/api/Committees/{id}/Events",
    "method": "GET",
    "toolName": "get_events_committee_by_id",
    "summary": "Return events related to the committee id provided",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Committee with id specified"
      }
    ],
    "queryParams": [
      {
        "name": "CommitteeBusinessId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of events related to a committee business"
      },
      {
        "name": "SearchTerm",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of events containing the search term specified. Must be 2 characters or more."
      },
      {
        "name": "StartDateFrom",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of events starting after the date provided"
      },
      {
        "name": "StartDateTo",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of events starting before the date provided"
      },
      {
        "name": "EndDateFrom",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of events ending after the date provided"
      },
      {
        "name": "House",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of events with committees pertaining to the house specified",
        "enum": [
          "Commons",
          "Lords",
          "Joint"
        ]
      },
      {
        "name": "LocationId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of events with the location id specified"
      },
      {
        "name": "ExcludeCancelledEvents",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Exclude cancelled events from the response"
      },
      {
        "name": "SortAscending",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Sort by start date ascending"
      },
      {
        "name": "EventTypeId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of events with the specified event type"
      },
      {
        "name": "IncludeEventAttendees",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Include the events attendees in the response (it's a little more expensive to do so)"
      },
      {
        "name": "ShowOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      },
      {
        "name": "Skip",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Numbers of items to skip - defaults to 0"
      },
      {
        "name": "Take",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Number of items to be returned - defaults to 30"
      }
    ]
  },
  {
    "path": "/api/Committees/{id}/Members",
    "method": "GET",
    "toolName": "list_committee_memberships",
    "summary": "Return a list of Memberships of a Committee",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "The committee id"
      }
    ],
    "queryParams": [
      {
        "name": "MembershipStatus",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of committee members' memberships by status",
        "enum": [
          "Current",
          "Former",
          "All"
        ]
      },
      {
        "name": "ShowOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      },
      {
        "name": "Skip",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Numbers of items to skip - defaults to 0"
      },
      {
        "name": "Take",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Number of items to be returned - defaults to 30"
      }
    ]
  },
  {
    "path": "/api/Committees/{id}/Members/{personId}",
    "method": "GET",
    "toolName": "get_committee_person_photo",
    "summary": "Return photo for a lay member of the committee",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "The committee id"
      },
      {
        "name": "personId",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Id of the lay member"
      }
    ],
    "queryParams": []
  },
  {
    "path": "/api/Committees/{id}/Staff",
    "method": "GET",
    "toolName": "list_committee_staff_memberships",
    "summary": "Return a list of staff members of a Committee",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "The committee id"
      }
    ],
    "queryParams": [
      {
        "name": "MembershipStatus",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of committee staff by status",
        "enum": [
          "Current",
          "Former",
          "All"
        ]
      },
      {
        "name": "ShowOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      },
      {
        "name": "Skip",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Numbers of items to skip - defaults to 0"
      },
      {
        "name": "Take",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Number of items to be returned - defaults to 30"
      }
    ]
  },
  {
    "path": "/api/Committees/{id}/Publications/Summary",
    "method": "GET",
    "toolName": "list_committee_publication_groups",
    "summary": "Return a list of Publication Groups for a Commitee",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "The committee id"
      }
    ],
    "queryParams": []
  },
  {
    "path": "/api/Committees/{id}/ArchivedPublicationLinks",
    "method": "GET",
    "toolName": "get_committee_archived_publication_links",
    "summary": "Return all CommitteeArchivedPublicationLinks linked to a Committee",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Committee Id specified"
      }
    ],
    "queryParams": []
  },
  {
    "path": "/api/Countries",
    "method": "GET",
    "toolName": "get_countries",
    "summary": "Return a list of Countries",
    "pathParams": [],
    "queryParams": []
  },
  {
    "path": "/api/Events",
    "method": "GET",
    "toolName": "get_events",
    "summary": "Return a list of events",
    "pathParams": [],
    "queryParams": [
      {
        "name": "CommitteeId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Return a list of events for the committee ID specified"
      },
      {
        "name": "CommitteeBusinessId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Return a list of events for the committee Business ID specified"
      },
      {
        "name": "GroupChildEventsWithParent",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Return child events as a property of its parent event - defaults to false"
      },
      {
        "name": "SearchTerm",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of events containing the search term specified. Must be 2 characters or more."
      },
      {
        "name": "StartDateFrom",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of events starting after the date provided"
      },
      {
        "name": "StartDateTo",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of events starting before the date provided"
      },
      {
        "name": "EndDateFrom",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of events ending after the date provided"
      },
      {
        "name": "House",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of events with committees pertaining to the house specified",
        "enum": [
          "Commons",
          "Lords",
          "Joint"
        ]
      },
      {
        "name": "LocationId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of events with the location id specified"
      },
      {
        "name": "ExcludeCancelledEvents",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Exclude cancelled events from the response"
      },
      {
        "name": "SortAscending",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Sort by start date ascending"
      },
      {
        "name": "EventTypeId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of events with the specified event type"
      },
      {
        "name": "IncludeEventAttendees",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Include the events attendees in the response (it's a little more expensive to do so)"
      },
      {
        "name": "ShowOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      },
      {
        "name": "Skip",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Numbers of items to skip - defaults to 0"
      },
      {
        "name": "Take",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Number of items to be returned - defaults to 30"
      }
    ]
  },
  {
    "path": "/api/Events/Activities",
    "method": "GET",
    "toolName": "get_event_activities",
    "summary": "Return a list of event activities",
    "pathParams": [],
    "queryParams": [
      {
        "name": "IncludeActivityAttendees",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Return a list of attendees with each activity - defaults to false"
      },
      {
        "name": "CommitteeId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Return a list of events for the committee ID specified"
      },
      {
        "name": "CommitteeBusinessId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Return a list of events for the committee Business ID specified"
      },
      {
        "name": "GroupChildEventsWithParent",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Return child events as a property of its parent event - defaults to false"
      },
      {
        "name": "SearchTerm",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of events containing the search term specified. Must be 2 characters or more."
      },
      {
        "name": "StartDateFrom",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of events starting after the date provided"
      },
      {
        "name": "StartDateTo",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of events starting before the date provided"
      },
      {
        "name": "EndDateFrom",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of events ending after the date provided"
      },
      {
        "name": "House",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of events with committees pertaining to the house specified",
        "enum": [
          "Commons",
          "Lords",
          "Joint"
        ]
      },
      {
        "name": "LocationId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of events with the location id specified"
      },
      {
        "name": "ExcludeCancelledEvents",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Exclude cancelled events from the response"
      },
      {
        "name": "SortAscending",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Sort by start date ascending"
      },
      {
        "name": "EventTypeId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of events with the specified event type"
      },
      {
        "name": "IncludeEventAttendees",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Include the events attendees in the response (it's a little more expensive to do so)"
      },
      {
        "name": "ShowOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      },
      {
        "name": "Skip",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Numbers of items to skip - defaults to 0"
      },
      {
        "name": "Take",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Number of items to be returned - defaults to 30"
      }
    ]
  },
  {
    "path": "/api/Events/{id}",
    "method": "GET",
    "toolName": "get_event_by_id",
    "summary": "Return an event",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Event Id to return"
      }
    ],
    "queryParams": [
      {
        "name": "showOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      }
    ]
  },
  {
    "path": "/api/Events/{id}/Attendance",
    "method": "GET",
    "toolName": "get_attendances_by_id",
    "summary": "Return a list of attendances for an event",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Event Id to return attendance for"
      }
    ],
    "queryParams": [
      {
        "name": "showOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      }
    ]
  },
  {
    "path": "/api/Events/{id}/Activities",
    "method": "GET",
    "toolName": "get_activities_by_id",
    "summary": "Return a list of activities for an event",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Event Id to return activities for"
      }
    ],
    "queryParams": [
      {
        "name": "showOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      }
    ]
  },
  {
    "path": "/api/Members",
    "method": "GET",
    "toolName": "list_members_committee_memberships",
    "summary": "Return a list of memberships for one or more members",
    "pathParams": [],
    "queryParams": [
      {
        "name": "Members",
        "in": "query",
        "required": true,
        "type": "array:number",
        "description": "List of member ids to filter by"
      },
      {
        "name": "MembershipStatus",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of committee members' memberships by status",
        "enum": [
          "Current",
          "Former",
          "All"
        ]
      },
      {
        "name": "CommitteeCategory",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of committee members' memberships by committee category",
        "enum": [
          "Select",
          "General",
          "Other"
        ]
      },
      {
        "name": "ShowOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      }
    ]
  },
  {
    "path": "/api/Messaging/Banners/{location}",
    "method": "GET",
    "toolName": "banners",
    "summary": "Return messaging banners",
    "pathParams": [
      {
        "name": "location",
        "in": "path",
        "required": true,
        "type": "string",
        "description": "Location of banner to return",
        "enum": [
          "HomePage",
          "FindACommitteePage",
          "CommonsCommitteeDetailsPage",
          "LordsCommitteeDetailsPage",
          "JointCommitteeDetailsPage",
          "FindAnInquiryPage",
          "FindAPublicationPage",
          "FormerCommitteesSearchPage"
        ]
      }
    ],
    "queryParams": []
  },
  {
    "path": "/api/OralEvidence",
    "method": "GET",
    "toolName": "get_oral_evidence",
    "summary": "Return a list of Oral Evidence",
    "pathParams": [],
    "queryParams": [
      {
        "name": "CommitteeBusinessId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of evidence related to a committee business with the committee business id"
      },
      {
        "name": "CommitteeId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of evidence related to a committee with the committee id"
      },
      {
        "name": "SearchTerm",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "Search by witness names, organisation names, and submission identifiers (where applicable). Must be 2 characters or more."
      },
      {
        "name": "StartDate",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of evidence published on or after date provided"
      },
      {
        "name": "EndDate",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of evidence published on or before date provided"
      },
      {
        "name": "ShowOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      },
      {
        "name": "Skip",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Numbers of items to skip - defaults to 0"
      },
      {
        "name": "Take",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Number of items to be returned - defaults to 30"
      }
    ]
  },
  {
    "path": "/api/OralEvidence/{id}",
    "method": "GET",
    "toolName": "get_oral_evidence_by_id",
    "summary": "Return an Oral Evidence",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Oral Evidence with ID specified"
      }
    ],
    "queryParams": [
      {
        "name": "showOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      }
    ]
  },
  {
    "path": "/api/OralEvidence/{id}/Document/{fileDataFormat}",
    "method": "GET",
    "toolName": "get_oral_evidence_document",
    "summary": "Return a document for an Oral Evidence",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Oral Evidence Id of the document return"
      },
      {
        "name": "fileDataFormat",
        "in": "path",
        "required": true,
        "type": "string",
        "description": "Type of file to return",
        "enum": [
          "OriginalFormat",
          "Html",
          "Pdf"
        ]
      }
    ],
    "queryParams": []
  },
  {
    "path": "/api/PublicationType",
    "method": "GET",
    "toolName": "list_publication_types",
    "summary": "Return a list of Publication Types",
    "pathParams": [],
    "queryParams": []
  },
  {
    "path": "/api/Publications",
    "method": "GET",
    "toolName": "get_publications",
    "summary": "Return a list of publications",
    "pathParams": [],
    "queryParams": [
      {
        "name": "PublicationTypeIds",
        "in": "query",
        "required": false,
        "type": "array:number",
        "description": "Ids for types of publications"
      },
      {
        "name": "SearchTerm",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "Search by publication description, metadata, and paper number (where applicable). Must be 2 characters or more."
      },
      {
        "name": "StartDate",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of publications published on or after date provided"
      },
      {
        "name": "EndDate",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of publications published on or before date provided"
      },
      {
        "name": "SortOrder",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List publications by specified sort order",
        "enum": [
          "PublicationDateDescending",
          "PublicationDateAscending",
          "ResponseDateDescending",
          "ResponseDateAscending"
        ]
      },
      {
        "name": "PaperNumbers",
        "in": "query",
        "required": false,
        "type": "array:string",
        "description": "List of publications by specfied paper numbers"
      },
      {
        "name": "CommitteeBusinessId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of publications related to a committee business with the committee business id"
      },
      {
        "name": "CommitteeId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of publications related to a committee with the committee id"
      },
      {
        "name": "ShowOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      },
      {
        "name": "Skip",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Numbers of items to skip - defaults to 0"
      },
      {
        "name": "Take",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Number of items to be returned - defaults to 30"
      }
    ]
  },
  {
    "path": "/api/Publications/{id}",
    "method": "GET",
    "toolName": "get_publication_by_id",
    "summary": "Return a publication",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Publication Id to return"
      }
    ],
    "queryParams": [
      {
        "name": "showOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      }
    ]
  },
  {
    "path": "/api/Publications/{id}/Document/{documentId}/{fileDataFormat}",
    "method": "GET",
    "toolName": "get_document",
    "summary": "Return a document for a publication",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Publication Id to return"
      },
      {
        "name": "documentId",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Document Id to return"
      },
      {
        "name": "fileDataFormat",
        "in": "path",
        "required": true,
        "type": "string",
        "description": "Type of file to return",
        "enum": [
          "OriginalFormat",
          "Html",
          "Pdf"
        ]
      }
    ],
    "queryParams": []
  },
  {
    "path": "/api/SubmissionPeriodTemplate/{id}/Document/{documentId}",
    "method": "GET",
    "toolName": "get_submission_period_template_document_by_id",
    "summary": "Return a submission period template file",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Submission period template id to return"
      },
      {
        "name": "documentId",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Document id to return"
      }
    ],
    "queryParams": []
  },
  {
    "path": "/api/SubmissionPeriod/{id}",
    "method": "GET",
    "toolName": "get_submission_period_by_id",
    "summary": "Return a submission period",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Submission period id to return"
      }
    ],
    "queryParams": []
  },
  {
    "path": "/api/WrittenEvidence",
    "method": "GET",
    "toolName": "get_written_evidence",
    "summary": "Return a list of Written Evidence",
    "pathParams": [],
    "queryParams": [
      {
        "name": "CommitteeBusinessId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of evidence related to a committee business with the committee business id"
      },
      {
        "name": "CommitteeId",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "List of evidence related to a committee with the committee id"
      },
      {
        "name": "SearchTerm",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "Search by witness names, organisation names, and submission identifiers (where applicable). Must be 2 characters or more."
      },
      {
        "name": "StartDate",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of evidence published on or after date provided"
      },
      {
        "name": "EndDate",
        "in": "query",
        "required": false,
        "type": "string",
        "description": "List of evidence published on or before date provided"
      },
      {
        "name": "ShowOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      },
      {
        "name": "Skip",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Numbers of items to skip - defaults to 0"
      },
      {
        "name": "Take",
        "in": "query",
        "required": false,
        "type": "number",
        "description": "Number of items to be returned - defaults to 30"
      }
    ]
  },
  {
    "path": "/api/WrittenEvidence/{id}",
    "method": "GET",
    "toolName": "get_written_evidence_by_id",
    "summary": "Return a Written Evidence",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Written Evidence with the Id specified"
      }
    ],
    "queryParams": [
      {
        "name": "showOnWebsiteOnly",
        "in": "query",
        "required": false,
        "type": "boolean",
        "description": "Only return committee website results - defaults to true"
      }
    ]
  },
  {
    "path": "/api/WrittenEvidence/{id}/Document/{fileDataFormat}",
    "method": "GET",
    "toolName": "get_written_evidence_document",
    "summary": "Return a document for a Written Evidence",
    "pathParams": [
      {
        "name": "id",
        "in": "path",
        "required": true,
        "type": "number",
        "description": "Evidence Id of the document return"
      },
      {
        "name": "fileDataFormat",
        "in": "path",
        "required": true,
        "type": "string",
        "description": "Type of file to return",
        "enum": [
          "OriginalFormat",
          "Html",
          "Pdf"
        ]
      }
    ],
    "queryParams": []
  }
];
export const ENDPOINTS_BY_TOOL_NAME = new Map(ENDPOINTS.map((endpoint) => [endpoint.toolName, endpoint]));
