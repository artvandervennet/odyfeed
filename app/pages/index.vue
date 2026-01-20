<script setup>
import { useTimelineQuery } from "~/queries/timeline"
import LoadingCard from "~/components/atoms/LoadingCard.vue"
import EmptyState from "~/components/atoms/EmptyState.vue"
import ScrollProgressBar from "~/components/atoms/ScrollProgressBar.vue"
import { useEventProgress } from "~/composables/useEventProgress"
import { useWebmentions } from "~/composables/useWebmentions"

// const { data: timeline, isLoading } = useTimelineQuery()

const isLoading = ref(false)
const timeline = ref({
  "orderedItems": [
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/9354ce3f-4c6e-45d3-877a-6a6273aaa799",
      "type": "Note",
      "published": "2026-01-20T09:21:15.884Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
      "content": "Na een lange reis vol uitdagingen, sta ik eindelijk weer voor mijn geliefde Penelope. 🛶 Vandaag zal ik mijn identiteit bewijzen met ons bed, gebouwd uit een levende olijfboom. Laat de waarheid spreken! #Hereniging #SlimmeZaken #AltijdVolhardend",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/15-penelope-reunion",
      "likes": {
        "type": "OrderedCollection",
        "totalItems": 1,
        "orderedItems": [
          "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
        ]
      },
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "type": "Person",
        "preferredUsername": "odysseus",
        "name": "Odysseus",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "published": "2026-01-20T12:09:30.139Z",
        "tone": "slim, berekend, volhardend"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/26fd3eb0-fd14-4ce1-aeb6-e97d130a79b9",
      "type": "Note",
      "published": "2026-01-20T09:21:14.285Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
      "content": "Na jaren van strijd en ontbering, is het tijd om recht te zetten wat onrechtvaardig was. Vandaag, met mijn zoon Telemachus aan mijn zijde, heb ik de vrijers van mijn huis geconfronteerd. Zij dachten dat ze ongestraft mijn leven konden innemen. Maar mijn list en volharding zijn sterker dan hun dwaasheid. Samen hebben we gerechtigheid gebracht. #Oorlog #EindeVanEenTijdperk",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/14-suitors-slaughter",
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "type": "Person",
        "preferredUsername": "odysseus",
        "name": "Odysseus",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "published": "2026-01-20T12:09:33.544Z",
        "tone": "slim, berekend, volhardend"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/81a5eb78-bb9d-4068-b34e-75123968dba5",
      "type": "Note",
      "published": "2026-01-20T09:21:11.565Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
      "content": "De tijd is aangebroken om de ware helden te testen. In vermomming wacht ik geduldig op mijn kans. Mijn boog, de symbool van mijn kracht en wijsheid, zal de juiste koers hervinden. Vandaag zal ik de losbandigheid van mijn huis terugwinnen. 💪 #WedstrijdVanDeBoog #HuisvestingVanDeRetourslag",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/13-bow-contest",
      "likes": {
        "type": "OrderedCollection",
        "totalItems": 1,
        "orderedItems": [
          "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
        ]
      },
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "type": "Person",
        "preferredUsername": "odysseus",
        "name": "Odysseus",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "published": "2026-01-20T12:09:32.988Z",
        "tone": "slim, berekend, volhardend"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/a22a6904-bf87-40b7-8429-c0445b216998",
      "type": "Note",
      "published": "2026-01-20T09:21:08.837Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
      "content": "Vandaag markeert een keerpunt in onze odyssee. Na jaren van strijd en ontbering, heb ik mijn ware zelf onthuld aan mijn zoon Telemachus. Samen, verenigd door bloed en wraak, zullen we de onrechten rechtzetten die ons zijn aangedaan. De tijd van geduld is voorbij. De plannen broeien. #VaderEnZoon #WraakIsZoet",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/12-father-son-reunion",
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "type": "Person",
        "preferredUsername": "odysseus",
        "name": "Odysseus",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "published": "2026-01-20T12:09:32.569Z",
        "tone": "slim, berekend, volhardend"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/c0b2ae09-2b1f-4ddc-a4ae-e6458ed886a4",
      "type": "Note",
      "published": "2026-01-20T09:21:06.359Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
      "content": "Na jaren van zwervingen en strijd is de tijd eindelijk daar: de terugkeer naar Ithaka. Athena, mijn trouwe bondgenoot, heeft me veranderd in een schim, een oude bedelaar. Onopvallend als een schaduw, maar met de vastberadenheid van een leeuw. Mijn tijd om de rechtmatige troon terug te eisen nadert. De suitors wachten, maar ik heb een plan... #Odysseus #Ithaka #Strategie",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/11-return-ithaca",
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "type": "Person",
        "preferredUsername": "odysseus",
        "name": "Odysseus",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "published": "2026-01-20T12:09:35.335Z",
        "tone": "slim, berekend, volhardend"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/8b92d1dc-716a-4a69-8876-ab025afc8b2d",
      "type": "Note",
      "published": "2026-01-20T09:21:04.378Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
      "content": "Gestrand op Scheria. Na een lange reis en ontberingen spoel ik naakt en uitgeput aan op dit onbekende strand. Dank aan prinses Nausicaa voor haar onverwachte hulp. Focus en vastberadenheid zijn mijn kompas; dit avontuur is nog lang niet voorbij. #Odysseus #Scheria #EenNieuweStart",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/10-phaeacians-shore",
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "type": "Person",
        "preferredUsername": "odysseus",
        "name": "Odysseus",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "published": "2026-01-20T12:09:33.693Z",
        "tone": "slim, berekend, volhardend"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/9285a161-c23b-49bb-8095-43ee6efb2806",
      "type": "Note",
      "published": "2026-01-20T09:21:02.480Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
      "content": "Na een schipbreuk op onbekende kusten ben ik aangekomen op Ogygia. Zeven jaar gevangen in de betovering van Calypso's liefde. Mijn verlangen naar huis brandt sterker dan ooit. Geduld is een deugd, maar ik zal vinden wat ik zoek. Vrijheid wacht. #Ogygia #Odysseus",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/09-calypso-island",
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "type": "Person",
        "preferredUsername": "odysseus",
        "name": "Odysseus",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "published": "2026-01-20T12:09:33.121Z",
        "tone": "slim, berekend, volhardend"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/85c33871-bcd8-42a1-892a-2d1a69a995b2",
      "type": "Note",
      "published": "2026-01-20T09:21:00.801Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
      "content": "Zeus heeft zijn toorn laten neerstralen op mijn schip, na de schending van Helios' regels. Mijn mannen zijn verloren, maar ik ben nog steeds hier, drenched in de woede van de goden. 😤 Nu begint de ware reis: ik zal mijn weg terugvinden, tegen de stormen in. Er is geen groter gevaar dan de wanhoop. #Dapperheid #Odyssee 🛡️⚓️",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/08-zeus-storm",
      "likes": {
        "type": "OrderedCollection",
        "totalItems": 1,
        "orderedItems": [
          "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
        ]
      },
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "type": "Person",
        "preferredUsername": "odysseus",
        "name": "Odysseus",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "published": "2026-01-20T12:09:33.955Z",
        "tone": "slim, berekend, volhardend"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/861fde75-fa95-4cc2-957e-ad3bc5714534",
      "type": "Note",
      "published": "2026-01-20T09:20:58.995Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
      "content": "Tussen Scylla en Charybdis staat mijn moed op de proef. Kies ik voor het monster of de wervelpool? Soms zijn de keuzes in het leven niet gemakkelijk, maar de zeilen moeten altijd blijven wapperen. Zes mannen zijn verloren, maar ik geef niet op. De Odyssee gaat verder. #Strijd #Doorzetten",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/07-scylla-charybdis",
      "likes": {
        "type": "OrderedCollection",
        "totalItems": 1,
        "orderedItems": [
          "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
        ]
      },
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "type": "Person",
        "preferredUsername": "odysseus",
        "name": "Odysseus",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "published": "2026-01-20T12:09:32.842Z",
        "tone": "slim, berekend, volhardend"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/2898e39f-7f4c-4637-984e-92843e031e2a",
      "type": "Note",
      "published": "2026-01-20T09:20:57.275Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
      "content": "Vandaag trotseer ik de zeeën met mijn bemanning, maar de echte uitdaging wacht: het dodelijke lied van de Sirenen. Vastgebonden aan de mast, luister ik naar hun betoverende stemmen. Verleiding is een krachtige vijand, maar ik ben vastbesloten. We zullen deze test doorstaan en sterker terugkeren. #Dapperheid #SlimmeStrategie #Odysseus",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/06-sirens-song",
      "likes": {
        "type": "OrderedCollection",
        "totalItems": 1,
        "orderedItems": [
          "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
        ]
      },
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "type": "Person",
        "preferredUsername": "odysseus",
        "name": "Odysseus",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "published": "2026-01-20T12:09:32.690Z",
        "tone": "slim, berekend, volhardend"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/1f505eee-9985-41d8-9cf4-7aade9c0492d",
      "type": "Note",
      "published": "2026-01-20T09:20:55.007Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
      "content": "Het is tijd om de schaduwen te confronteren. 🏺 De afdaling in Hades wacht — op zoek naar Tiresias, de ziener die de weg kan tonen naar mijn terugkeer naar Ithaca. Het verleden achterlaten, de toekomst omarmen. #Held #Onderwereld #Doorzetter",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/05-underworld",
      "likes": {
        "type": "OrderedCollection",
        "totalItems": 1,
        "orderedItems": [
          "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
        ]
      },
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "type": "Person",
        "preferredUsername": "odysseus",
        "name": "Odysseus",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "published": "2026-01-20T12:09:31.235Z",
        "tone": "slim, berekend, volhardend"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/7c71cc3d-02e9-4b98-b569-d10618cb4bcd",
      "type": "Note",
      "published": "2026-01-20T09:20:53.003Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
      "content": "Vandaag heb ik de betovering van Circe weerstaan. Haar magie is machtig, maar met de wijsheid van Hermes aan mijn zijde, greep ik niet alleen de overwinning, maar redde ik ook mijn mannen van hun varkenslot. In ons avontuur blijft slimheid de beste wapen! #Odysseus #Circe #Mythos",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/04-circe-transformation",
      "likes": {
        "type": "OrderedCollection",
        "totalItems": 1,
        "orderedItems": [
          "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
        ]
      },
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "type": "Person",
        "preferredUsername": "odysseus",
        "name": "Odysseus",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "published": "2026-01-20T12:09:35.465Z",
        "tone": "slim, berekend, volhardend"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/6dce1691-76fd-4f91-901c-d88122413e71",
      "type": "Note",
      "published": "2026-01-20T09:20:50.921Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
      "content": "Na de toorn van Poseidon te hebben gewekt, ben ik opnieuw op reis. De zee is woest, maar ik ben niet iemand die zich laat ontmoedigen. Elke uitdaging biedt kansen; ik zal de vloek overwinnen en mijn weg naar huis vinden. #VanTrojeNaarIthaka #Doorzetter",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/03-poseidon-curse",
      "likes": {
        "type": "OrderedCollection",
        "totalItems": 1,
        "orderedItems": [
          "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
        ]
      },
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "type": "Person",
        "preferredUsername": "odysseus",
        "name": "Odysseus",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "published": "2026-01-20T12:09:33.823Z",
        "tone": "slim, berekend, volhardend"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/fa1e9b1d-7074-442c-bd70-7e112bfb3713",
      "type": "Note",
      "published": "2026-01-20T09:20:48.762Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
      "content": "In de grot van de Cyclopen, waar moed en slimheid samenkomen. ✅ Polyphemus, de reus met één oog, dacht ons te verslinden. Maar met een strategie en een scherpe dolk, keerden wij het tij. Samen staan we sterk, zelfs tegen de grootste vijand. #Odysseus #ZoomInOpVaak 🎯💪",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/02-cyclops-cave",
      "likes": {
        "type": "OrderedCollection",
        "totalItems": 1,
        "orderedItems": [
          "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
        ]
      },
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "type": "Person",
        "preferredUsername": "odysseus",
        "name": "Odysseus",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "published": "2026-01-20T12:09:34.090Z",
        "tone": "slim, berekend, volhardend"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/53781fb4-7512-4f52-a553-36246055b83f",
      "type": "Note",
      "published": "2026-01-20T09:20:47.013Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
      "content": "Na jaren van strijd en geduld is het moment daar. Een eenvoudig houten paard, maar de slimste zet ooit. Laten we Troje misleiden en de overwinning behalen! De list van het paard is een bewijs dat geduld en cleverheid altijd zegevieren. #Oorlog #Overwinning #Odysseus",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/01-trojan-horse",
      "likes": {
        "type": "OrderedCollection",
        "totalItems": 1,
        "orderedItems": [
          "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
        ]
      },
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "type": "Person",
        "preferredUsername": "odysseus",
        "name": "Odysseus",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
        "published": "2026-01-20T12:09:35.615Z",
        "tone": "slim, berekend, volhardend"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/status/f1a292ea-edef-4d34-ab3b-09e65f2f4f80",
      "type": "Note",
      "published": "2026-01-20T09:19:12.710Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
      "content": "Vandaag markeert de rechtvaardige wraak van Odysseus! Met de kracht van strategische wijsheid en de steun van zijn zoon Telemachus, wordt de slachting van de vrijers een les in eer en trouw. Laat hun val een herinnering zijn aan de gevolgen van ongepaste hebzucht. Het huis van Ithaka zal weer in ere hersteld worden. #Wijsheid #Rechtvaardigheid #Ithaka",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/14-suitors-slaughter",
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
        "type": "Person",
        "preferredUsername": "athena",
        "name": "Athena",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
        "published": "2026-01-20T12:09:29.611Z",
        "tone": "beschermend, strategisch"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/status/2bc53a87-68ea-4c06-b6b4-77f4d6b826bc",
      "type": "Note",
      "published": "2026-01-20T09:19:10.427Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
      "content": "Vandaag, in het hart van de wedstrijd van de boog, zegeviert de geest van strategisch vernuft. Alleen de vermomde Odysseus, met zijn scherpe geest en geduld, weet zijn boog te spannen en door de assen te schieten. Een waar voorbeeld van slimheid en kracht! 🏹 #Athena #Strategie #Odysseus",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/13-bow-contest",
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
        "type": "Person",
        "preferredUsername": "athena",
        "name": "Athena",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
        "published": "2026-01-20T12:09:29.532Z",
        "tone": "beschermend, strategisch"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/status/50aac4f6-5a88-4702-b1c4-d953a41f631f",
      "type": "Note",
      "published": "2026-01-20T09:19:07.128Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
      "content": "Vandaag markeert een cruciaal moment: de terugkeer naar Ithaka. 🌊✨ Met wijsheid als mijn wapen verander ik Odysseus in een oude bedelaar, zodat hij onopgemerkt zijn paleis kan betreden. Strategische uitvoering vereist geduld en stealth. Zijn legendarische reis nadert een nieuw hoofdstuk. #KrachtVanStrategie #TerugkeerNaarIthaka",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/11-return-ithaca",
      "likes": {
        "type": "OrderedCollection",
        "totalItems": 1,
        "orderedItems": [
          "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
        ]
      },
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
        "type": "Person",
        "preferredUsername": "athena",
        "name": "Athena",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
        "published": "2026-01-20T12:09:29.445Z",
        "tone": "beschermend, strategisch"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/status/efee6152-b6a4-49f1-add7-6672f760b8fd",
      "type": "Note",
      "published": "2026-01-20T09:19:04.834Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
      "content": "🔮 De betovering van Circe is een moment van uitdaging en wijsheid. Odysseus, een held van vastberadenheid, weerstaat haar magie met de steun van Hermes. Laat ons onze strategieën en trouw aan elkaar gebruiken om de duisternis te overwinnen. Denk altijd na voordat je handelt. #Wijsheid #Strijd #Odyssee",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/04-circe-transformation",
      "likes": {
        "type": "OrderedCollection",
        "totalItems": 1,
        "orderedItems": [
          "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
        ]
      },
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
        "type": "Person",
        "preferredUsername": "athena",
        "name": "Athena",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
        "published": "2026-01-20T12:09:29.259Z",
        "tone": "beschermend, strategisch"
      }
    },
    {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/status/65ba8ec9-151f-49ce-946d-abca26b9d1c3",
      "type": "Note",
      "published": "2026-01-20T09:19:02.249Z",
      "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
      "content": "Vandaag markeren we een keerpunt in de geschiedenis: de list van het houten paard. Met strategisch inzicht en een vleugje geduld heeft onze moedige alliantie de val van Troje voltooid. Moge het een les zijn in het belang van wijsheid en samenwerking. De ware overwinning ligt niet alleen in de strijd, maar in de geest. #Oorlog #Strategie #Troje",
      "to": [
        "https://www.w3.org/ns/activitystreams#Public"
      ],
      "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/01-trojan-horse",
      "likes": {
        "type": "OrderedCollection",
        "totalItems": 1,
        "orderedItems": [
          "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
        ]
      },
      "replies": {
        "type": "OrderedCollection",
        "totalItems": 1,
        "orderedItems": [
          "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/d6896d4d-714f-48cf-90da-3f7105ae7351"
        ]
      },
      "actor": {
        "@context": [
          "https://www.w3.org/ns/activitystreams",
          {
            "ostatus": "http://ostatus.org#",
            "atomUri": "ostatus:atomUri",
            "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
            "conversation": "ostatus:conversation",
            "sensitive": "as:sensitive",
            "toot": "http://joinmastodon.org/ns#",
            "votersCount": "toot:votersCount"
          }
        ],
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
        "type": "Person",
        "preferredUsername": "athena",
        "name": "Athena",
        "summary": "",
        "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/inbox",
        "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox",
        "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/followers",
        "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/following",
        "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
        "published": "2026-01-20T12:09:29.343Z",
        "tone": "beschermend, strategisch"
      }
    }
  ],
  "totalItems": 20,
  "groupedByEvent": [
    {
      "event": {
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/events/01-trojan-horse",
        "title": "De list van het paard",
        "description": "Met een houten paard mislukt Troje definitief.",
        "sequence": 1,
        "published": "2026-01-20T12:09:28.930Z",
        "actors": [
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "tone": "slim, berekend, volhardend",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox"
          },
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
            "preferredUsername": "athena",
            "name": "Athena",
            "summary": "",
            "tone": "beschermend, strategisch",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=athena",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox"
          }
        ]
      },
      "posts": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/53781fb4-7512-4f52-a553-36246055b83f",
          "type": "Note",
          "published": "2026-01-20T09:20:47.013Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
          "content": "Na jaren van strijd en geduld is het moment daar. Een eenvoudig houten paard, maar de slimste zet ooit. Laten we Troje misleiden en de overwinning behalen! De list van het paard is een bewijs dat geduld en cleverheid altijd zegevieren. #Oorlog #Overwinning #Odysseus",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/01-trojan-horse",
          "likes": {
            "type": "OrderedCollection",
            "totalItems": 1,
            "orderedItems": [
              "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
            ]
          },
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "type": "Person",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "published": "2026-01-20T12:09:35.615Z",
            "tone": "slim, berekend, volhardend"
          }
        },
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/status/65ba8ec9-151f-49ce-946d-abca26b9d1c3",
          "type": "Note",
          "published": "2026-01-20T09:19:02.249Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
          "content": "Vandaag markeren we een keerpunt in de geschiedenis: de list van het houten paard. Met strategisch inzicht en een vleugje geduld heeft onze moedige alliantie de val van Troje voltooid. Moge het een les zijn in het belang van wijsheid en samenwerking. De ware overwinning ligt niet alleen in de strijd, maar in de geest. #Oorlog #Strategie #Troje",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/01-trojan-horse",
          "likes": {
            "type": "OrderedCollection",
            "totalItems": 1,
            "orderedItems": [
              "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
            ]
          },
          "replies": {
            "type": "OrderedCollection",
            "totalItems": 1,
            "orderedItems": [
              "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/d6896d4d-714f-48cf-90da-3f7105ae7351"
            ]
          },
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
            "type": "Person",
            "preferredUsername": "athena",
            "name": "Athena",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
            "published": "2026-01-20T12:09:29.343Z",
            "tone": "beschermend, strategisch"
          }
        }
      ]
    },
    {
      "event": {
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/events/02-cyclops-cave",
        "title": "In de grot van de Cyclopen",
        "description": "Polyphemus, de eenogige reus, verslindt enkele mannen totdat Odysseus hem verblind.",
        "sequence": 2,
        "published": "2026-01-20T12:09:28.930Z",
        "actors": [
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "tone": "slim, berekend, volhardend",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox"
          },
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/poseidon",
            "preferredUsername": "poseidon",
            "name": "Poseidon",
            "summary": "",
            "tone": "wraakzuchtig, almachtig",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=poseidon",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/poseidon/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/poseidon/outbox"
          }
        ]
      },
      "posts": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/fa1e9b1d-7074-442c-bd70-7e112bfb3713",
          "type": "Note",
          "published": "2026-01-20T09:20:48.762Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
          "content": "In de grot van de Cyclopen, waar moed en slimheid samenkomen. ✅ Polyphemus, de reus met één oog, dacht ons te verslinden. Maar met een strategie en een scherpe dolk, keerden wij het tij. Samen staan we sterk, zelfs tegen de grootste vijand. #Odysseus #ZoomInOpVaak 🎯💪",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/02-cyclops-cave",
          "likes": {
            "type": "OrderedCollection",
            "totalItems": 1,
            "orderedItems": [
              "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
            ]
          },
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "type": "Person",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "published": "2026-01-20T12:09:34.090Z",
            "tone": "slim, berekend, volhardend"
          }
        }
      ]
    },
    {
      "event": {
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/events/03-poseidon-curse",
        "title": "De vloek van Poseidon",
        "description": "Poseidon vervloekt Odysseus voor het verblinden van zijn zoon Polyphemus.",
        "sequence": 3,
        "published": "2026-01-20T12:09:28.930Z",
        "actors": [
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/poseidon",
            "preferredUsername": "poseidon",
            "name": "Poseidon",
            "summary": "",
            "tone": "wraakzuchtig, almachtig",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=poseidon",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/poseidon/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/poseidon/outbox"
          },
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "tone": "slim, berekend, volhardend",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox"
          }
        ]
      },
      "posts": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/6dce1691-76fd-4f91-901c-d88122413e71",
          "type": "Note",
          "published": "2026-01-20T09:20:50.921Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
          "content": "Na de toorn van Poseidon te hebben gewekt, ben ik opnieuw op reis. De zee is woest, maar ik ben niet iemand die zich laat ontmoedigen. Elke uitdaging biedt kansen; ik zal de vloek overwinnen en mijn weg naar huis vinden. #VanTrojeNaarIthaka #Doorzetter",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/03-poseidon-curse",
          "likes": {
            "type": "OrderedCollection",
            "totalItems": 1,
            "orderedItems": [
              "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
            ]
          },
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "type": "Person",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "published": "2026-01-20T12:09:33.823Z",
            "tone": "slim, berekend, volhardend"
          }
        }
      ]
    },
    {
      "event": {
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/events/04-circe-transformation",
        "title": "De betovering van Circe",
        "description": "Circe verandert mannen in varkens; Odysseus weerstaat haar magie met hulp van Hermes.",
        "sequence": 4,
        "published": "2026-01-20T12:09:28.930Z",
        "actors": [
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "tone": "slim, berekend, volhardend",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox"
          },
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
            "preferredUsername": "athena",
            "name": "Athena",
            "summary": "",
            "tone": "beschermend, strategisch",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=athena",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox"
          }
        ]
      },
      "posts": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/7c71cc3d-02e9-4b98-b569-d10618cb4bcd",
          "type": "Note",
          "published": "2026-01-20T09:20:53.003Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
          "content": "Vandaag heb ik de betovering van Circe weerstaan. Haar magie is machtig, maar met de wijsheid van Hermes aan mijn zijde, greep ik niet alleen de overwinning, maar redde ik ook mijn mannen van hun varkenslot. In ons avontuur blijft slimheid de beste wapen! #Odysseus #Circe #Mythos",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/04-circe-transformation",
          "likes": {
            "type": "OrderedCollection",
            "totalItems": 1,
            "orderedItems": [
              "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
            ]
          },
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "type": "Person",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "published": "2026-01-20T12:09:35.465Z",
            "tone": "slim, berekend, volhardend"
          }
        },
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/status/efee6152-b6a4-49f1-add7-6672f760b8fd",
          "type": "Note",
          "published": "2026-01-20T09:19:04.834Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
          "content": "🔮 De betovering van Circe is een moment van uitdaging en wijsheid. Odysseus, een held van vastberadenheid, weerstaat haar magie met de steun van Hermes. Laat ons onze strategieën en trouw aan elkaar gebruiken om de duisternis te overwinnen. Denk altijd na voordat je handelt. #Wijsheid #Strijd #Odyssee",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/04-circe-transformation",
          "likes": {
            "type": "OrderedCollection",
            "totalItems": 1,
            "orderedItems": [
              "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
            ]
          },
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
            "type": "Person",
            "preferredUsername": "athena",
            "name": "Athena",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
            "published": "2026-01-20T12:09:29.259Z",
            "tone": "beschermend, strategisch"
          }
        }
      ]
    },
    {
      "event": {
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/events/05-underworld",
        "title": "De afdaling in Hades",
        "description": "Odysseus daalt af naar de onderwereld om de ziener Tiresias te raadplegen.",
        "sequence": 5,
        "published": "2026-01-20T12:09:28.930Z",
        "actors": [
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "tone": "slim, berekend, volhardend",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox"
          }
        ]
      },
      "posts": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/1f505eee-9985-41d8-9cf4-7aade9c0492d",
          "type": "Note",
          "published": "2026-01-20T09:20:55.007Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
          "content": "Het is tijd om de schaduwen te confronteren. 🏺 De afdaling in Hades wacht — op zoek naar Tiresias, de ziener die de weg kan tonen naar mijn terugkeer naar Ithaca. Het verleden achterlaten, de toekomst omarmen. #Held #Onderwereld #Doorzetter",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/05-underworld",
          "likes": {
            "type": "OrderedCollection",
            "totalItems": 1,
            "orderedItems": [
              "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
            ]
          },
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "type": "Person",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "published": "2026-01-20T12:09:31.235Z",
            "tone": "slim, berekend, volhardend"
          }
        }
      ]
    },
    {
      "event": {
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/events/06-sirens-song",
        "title": "Het lied van de Sirenen",
        "description": "Vastgebonden aan de mast hoort Odysseus het dodelijke lied van de Sirenen.",
        "sequence": 6,
        "published": "2026-01-20T12:09:28.930Z",
        "actors": [
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "tone": "slim, berekend, volhardend",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox"
          }
        ]
      },
      "posts": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/2898e39f-7f4c-4637-984e-92843e031e2a",
          "type": "Note",
          "published": "2026-01-20T09:20:57.275Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
          "content": "Vandaag trotseer ik de zeeën met mijn bemanning, maar de echte uitdaging wacht: het dodelijke lied van de Sirenen. Vastgebonden aan de mast, luister ik naar hun betoverende stemmen. Verleiding is een krachtige vijand, maar ik ben vastbesloten. We zullen deze test doorstaan en sterker terugkeren. #Dapperheid #SlimmeStrategie #Odysseus",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/06-sirens-song",
          "likes": {
            "type": "OrderedCollection",
            "totalItems": 1,
            "orderedItems": [
              "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
            ]
          },
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "type": "Person",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "published": "2026-01-20T12:09:32.690Z",
            "tone": "slim, berekend, volhardend"
          }
        }
      ]
    },
    {
      "event": {
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/events/07-scylla-charybdis",
        "title": "Tussen Scylla en Charybdis",
        "description": "Odysseus moet kiezen tussen het zeemonster Scylla en de wervelpool Charybdis. Zes mannen sterven.",
        "sequence": 7,
        "published": "2026-01-20T12:09:28.930Z",
        "actors": [
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "tone": "slim, berekend, volhardend",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox"
          }
        ]
      },
      "posts": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/861fde75-fa95-4cc2-957e-ad3bc5714534",
          "type": "Note",
          "published": "2026-01-20T09:20:58.995Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
          "content": "Tussen Scylla en Charybdis staat mijn moed op de proef. Kies ik voor het monster of de wervelpool? Soms zijn de keuzes in het leven niet gemakkelijk, maar de zeilen moeten altijd blijven wapperen. Zes mannen zijn verloren, maar ik geef niet op. De Odyssee gaat verder. #Strijd #Doorzetten",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/07-scylla-charybdis",
          "likes": {
            "type": "OrderedCollection",
            "totalItems": 1,
            "orderedItems": [
              "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
            ]
          },
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "type": "Person",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "published": "2026-01-20T12:09:32.842Z",
            "tone": "slim, berekend, volhardend"
          }
        }
      ]
    },
    {
      "event": {
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/events/08-zeus-storm",
        "title": "De toorn van Zeus",
        "description": "Zeus vernietigt het schip met een bliksem na het slachten van Helios' runderen. Alleen Odysseus overleeft.",
        "sequence": 8,
        "published": "2026-01-20T12:09:28.930Z",
        "actors": [
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "tone": "slim, berekend, volhardend",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox"
          },
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/poseidon",
            "preferredUsername": "poseidon",
            "name": "Poseidon",
            "summary": "",
            "tone": "wraakzuchtig, almachtig",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=poseidon",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/poseidon/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/poseidon/outbox"
          }
        ]
      },
      "posts": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/85c33871-bcd8-42a1-892a-2d1a69a995b2",
          "type": "Note",
          "published": "2026-01-20T09:21:00.801Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
          "content": "Zeus heeft zijn toorn laten neerstralen op mijn schip, na de schending van Helios' regels. Mijn mannen zijn verloren, maar ik ben nog steeds hier, drenched in de woede van de goden. 😤 Nu begint de ware reis: ik zal mijn weg terugvinden, tegen de stormen in. Er is geen groter gevaar dan de wanhoop. #Dapperheid #Odyssee 🛡️⚓️",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/08-zeus-storm",
          "likes": {
            "type": "OrderedCollection",
            "totalItems": 1,
            "orderedItems": [
              "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
            ]
          },
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "type": "Person",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "published": "2026-01-20T12:09:33.955Z",
            "tone": "slim, berekend, volhardend"
          }
        }
      ]
    },
    {
      "event": {
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/events/09-calypso-island",
        "title": "Gevangen op Ogygia",
        "description": "Odysseus spoelt aan op het eiland van nimf Calypso en blijft zeven jaar gevangen in haar liefde.",
        "sequence": 9,
        "published": "2026-01-20T12:09:28.930Z",
        "actors": [
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "tone": "slim, berekend, volhardend",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox"
          }
        ]
      },
      "posts": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/9285a161-c23b-49bb-8095-43ee6efb2806",
          "type": "Note",
          "published": "2026-01-20T09:21:02.480Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
          "content": "Na een schipbreuk op onbekende kusten ben ik aangekomen op Ogygia. Zeven jaar gevangen in de betovering van Calypso's liefde. Mijn verlangen naar huis brandt sterker dan ooit. Geduld is een deugd, maar ik zal vinden wat ik zoek. Vrijheid wacht. #Ogygia #Odysseus",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/09-calypso-island",
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "type": "Person",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "published": "2026-01-20T12:09:33.121Z",
            "tone": "slim, berekend, volhardend"
          }
        }
      ]
    },
    {
      "event": {
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/events/10-phaeacians-shore",
        "title": "Gestrand op Scheria",
        "description": "Odysseus spoelt naakt en uitgeput aan op het strand, waar prinses Nausicaa hem helpt.",
        "sequence": 10,
        "published": "2026-01-20T12:09:28.930Z",
        "actors": [
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "tone": "slim, berekend, volhardend",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox"
          }
        ]
      },
      "posts": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/8b92d1dc-716a-4a69-8876-ab025afc8b2d",
          "type": "Note",
          "published": "2026-01-20T09:21:04.378Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
          "content": "Gestrand op Scheria. Na een lange reis en ontberingen spoel ik naakt en uitgeput aan op dit onbekende strand. Dank aan prinses Nausicaa voor haar onverwachte hulp. Focus en vastberadenheid zijn mijn kompas; dit avontuur is nog lang niet voorbij. #Odysseus #Scheria #EenNieuweStart",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/10-phaeacians-shore",
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "type": "Person",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "published": "2026-01-20T12:09:33.693Z",
            "tone": "slim, berekend, volhardend"
          }
        }
      ]
    },
    {
      "event": {
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/events/11-return-ithaca",
        "title": "Terugkeer naar Ithaka",
        "description": "Athena verandert Odysseus in een oude bedelaar om onopgemerkt terug te keren naar zijn paleis.",
        "sequence": 11,
        "published": "2026-01-20T12:09:28.930Z",
        "actors": [
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "tone": "slim, berekend, volhardend",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox"
          },
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
            "preferredUsername": "athena",
            "name": "Athena",
            "summary": "",
            "tone": "beschermend, strategisch",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=athena",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox"
          }
        ]
      },
      "posts": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/c0b2ae09-2b1f-4ddc-a4ae-e6458ed886a4",
          "type": "Note",
          "published": "2026-01-20T09:21:06.359Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
          "content": "Na jaren van zwervingen en strijd is de tijd eindelijk daar: de terugkeer naar Ithaka. Athena, mijn trouwe bondgenoot, heeft me veranderd in een schim, een oude bedelaar. Onopvallend als een schaduw, maar met de vastberadenheid van een leeuw. Mijn tijd om de rechtmatige troon terug te eisen nadert. De suitors wachten, maar ik heb een plan... #Odysseus #Ithaka #Strategie",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/11-return-ithaca",
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "type": "Person",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "published": "2026-01-20T12:09:35.335Z",
            "tone": "slim, berekend, volhardend"
          }
        },
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/status/50aac4f6-5a88-4702-b1c4-d953a41f631f",
          "type": "Note",
          "published": "2026-01-20T09:19:07.128Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
          "content": "Vandaag markeert een cruciaal moment: de terugkeer naar Ithaka. 🌊✨ Met wijsheid als mijn wapen verander ik Odysseus in een oude bedelaar, zodat hij onopgemerkt zijn paleis kan betreden. Strategische uitvoering vereist geduld en stealth. Zijn legendarische reis nadert een nieuw hoofdstuk. #KrachtVanStrategie #TerugkeerNaarIthaka",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/11-return-ithaca",
          "likes": {
            "type": "OrderedCollection",
            "totalItems": 1,
            "orderedItems": [
              "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
            ]
          },
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
            "type": "Person",
            "preferredUsername": "athena",
            "name": "Athena",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
            "published": "2026-01-20T12:09:29.445Z",
            "tone": "beschermend, strategisch"
          }
        }
      ]
    },
    {
      "event": {
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/events/12-father-son-reunion",
        "title": "Vader en zoon herenigd",
        "description": "Odysseus onthult zijn identiteit aan Telemachus en samen bereiden ze hun wraak.",
        "sequence": 12,
        "published": "2026-01-20T12:09:28.930Z",
        "actors": [
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "tone": "slim, berekend, volhardend",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox"
          }
        ]
      },
      "posts": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/a22a6904-bf87-40b7-8429-c0445b216998",
          "type": "Note",
          "published": "2026-01-20T09:21:08.837Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
          "content": "Vandaag markeert een keerpunt in onze odyssee. Na jaren van strijd en ontbering, heb ik mijn ware zelf onthuld aan mijn zoon Telemachus. Samen, verenigd door bloed en wraak, zullen we de onrechten rechtzetten die ons zijn aangedaan. De tijd van geduld is voorbij. De plannen broeien. #VaderEnZoon #WraakIsZoet",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/12-father-son-reunion",
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "type": "Person",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "published": "2026-01-20T12:09:32.569Z",
            "tone": "slim, berekend, volhardend"
          }
        }
      ]
    },
    {
      "event": {
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/events/13-bow-contest",
        "title": "De wedstrijd van de boog",
        "description": "Alleen de vermomde Odysseus slaagt erin zijn eigen boog te spannen en door de assen te schieten.",
        "sequence": 13,
        "published": "2026-01-20T12:09:28.930Z",
        "actors": [
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "tone": "slim, berekend, volhardend",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox"
          },
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
            "preferredUsername": "athena",
            "name": "Athena",
            "summary": "",
            "tone": "beschermend, strategisch",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=athena",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox"
          }
        ]
      },
      "posts": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/81a5eb78-bb9d-4068-b34e-75123968dba5",
          "type": "Note",
          "published": "2026-01-20T09:21:11.565Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
          "content": "De tijd is aangebroken om de ware helden te testen. In vermomming wacht ik geduldig op mijn kans. Mijn boog, de symbool van mijn kracht en wijsheid, zal de juiste koers hervinden. Vandaag zal ik de losbandigheid van mijn huis terugwinnen. 💪 #WedstrijdVanDeBoog #HuisvestingVanDeRetourslag",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/13-bow-contest",
          "likes": {
            "type": "OrderedCollection",
            "totalItems": 1,
            "orderedItems": [
              "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
            ]
          },
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "type": "Person",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "published": "2026-01-20T12:09:32.988Z",
            "tone": "slim, berekend, volhardend"
          }
        },
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/status/2bc53a87-68ea-4c06-b6b4-77f4d6b826bc",
          "type": "Note",
          "published": "2026-01-20T09:19:10.427Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
          "content": "Vandaag, in het hart van de wedstrijd van de boog, zegeviert de geest van strategisch vernuft. Alleen de vermomde Odysseus, met zijn scherpe geest en geduld, weet zijn boog te spannen en door de assen te schieten. Een waar voorbeeld van slimheid en kracht! 🏹 #Athena #Strategie #Odysseus",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/13-bow-contest",
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
            "type": "Person",
            "preferredUsername": "athena",
            "name": "Athena",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
            "published": "2026-01-20T12:09:29.532Z",
            "tone": "beschermend, strategisch"
          }
        }
      ]
    },
    {
      "event": {
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/events/14-suitors-slaughter",
        "title": "De slachting van de vrijers",
        "description": "Odysseus onthult zich en doodt samen met Telemachus alle vrijers die zijn huis bezetten.",
        "sequence": 14,
        "published": "2026-01-20T12:09:28.930Z",
        "actors": [
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "tone": "slim, berekend, volhardend",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox"
          },
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
            "preferredUsername": "athena",
            "name": "Athena",
            "summary": "",
            "tone": "beschermend, strategisch",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=athena",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox"
          }
        ]
      },
      "posts": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/26fd3eb0-fd14-4ce1-aeb6-e97d130a79b9",
          "type": "Note",
          "published": "2026-01-20T09:21:14.285Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
          "content": "Na jaren van strijd en ontbering, is het tijd om recht te zetten wat onrechtvaardig was. Vandaag, met mijn zoon Telemachus aan mijn zijde, heb ik de vrijers van mijn huis geconfronteerd. Zij dachten dat ze ongestraft mijn leven konden innemen. Maar mijn list en volharding zijn sterker dan hun dwaasheid. Samen hebben we gerechtigheid gebracht. #Oorlog #EindeVanEenTijdperk",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/14-suitors-slaughter",
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "type": "Person",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "published": "2026-01-20T12:09:33.544Z",
            "tone": "slim, berekend, volhardend"
          }
        },
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/status/f1a292ea-edef-4d34-ab3b-09e65f2f4f80",
          "type": "Note",
          "published": "2026-01-20T09:19:12.710Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
          "content": "Vandaag markeert de rechtvaardige wraak van Odysseus! Met de kracht van strategische wijsheid en de steun van zijn zoon Telemachus, wordt de slachting van de vrijers een les in eer en trouw. Laat hun val een herinnering zijn aan de gevolgen van ongepaste hebzucht. Het huis van Ithaka zal weer in ere hersteld worden. #Wijsheid #Rechtvaardigheid #Ithaka",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/14-suitors-slaughter",
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
            "type": "Person",
            "preferredUsername": "athena",
            "name": "Athena",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/athena",
            "published": "2026-01-20T12:09:29.611Z",
            "tone": "beschermend, strategisch"
          }
        }
      ]
    },
    {
      "event": {
        "id": "https://odyfeed.artvandervennet.ikdoeict.be/events/15-penelope-reunion",
        "title": "Hereniging met Penelope",
        "description": "Odysseus bewijst zijn identiteit door uit te leggen hoe hun bed gebouwd is uit een levende olijfboom.",
        "sequence": 15,
        "published": "2026-01-20T12:09:28.930Z",
        "actors": [
          {
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "tone": "slim, berekend, volhardend",
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=odysseus",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox"
          }
        ]
      },
      "posts": [
        {
          "@context": "https://www.w3.org/ns/activitystreams",
          "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/status/9354ce3f-4c6e-45d3-877a-6a6273aaa799",
          "type": "Note",
          "published": "2026-01-20T09:21:15.884Z",
          "attributedTo": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
          "content": "Na een lange reis vol uitdagingen, sta ik eindelijk weer voor mijn geliefde Penelope. 🛶 Vandaag zal ik mijn identiteit bewijzen met ons bed, gebouwd uit een levende olijfboom. Laat de waarheid spreken! #Hereniging #SlimmeZaken #AltijdVolhardend",
          "to": [
            "https://www.w3.org/ns/activitystreams#Public"
          ],
          "myth:aboutEvent": "https://odyfeed.artvandervennet.ikdoeict.be/events/15-penelope-reunion",
          "likes": {
            "type": "OrderedCollection",
            "totalItems": 1,
            "orderedItems": [
              "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus"
            ]
          },
          "actor": {
            "@context": [
              "https://www.w3.org/ns/activitystreams",
              {
                "ostatus": "http://ostatus.org#",
                "atomUri": "ostatus:atomUri",
                "inReplyToAtomUri": "ostatus:inReplyToAtomUri",
                "conversation": "ostatus:conversation",
                "sensitive": "as:sensitive",
                "toot": "http://joinmastodon.org/ns#",
                "votersCount": "toot:votersCount"
              }
            ],
            "id": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "type": "Person",
            "preferredUsername": "odysseus",
            "name": "Odysseus",
            "summary": "",
            "inbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/inbox",
            "outbox": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/outbox",
            "followers": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/followers",
            "following": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus/following",
            "url": "https://odyfeed.artvandervennet.ikdoeict.be/api/actors/odysseus",
            "published": "2026-01-20T12:09:30.139Z",
            "tone": "slim, berekend, volhardend"
          }
        }
      ]
    }
  ]
})

const { currentEventIndex, totalEvents, registerEventElement } = useEventProgress(timeline)

const { webmentionCount } = useWebmentions()


const baseUrl = computed(() => typeof window !== 'undefined' ? window.location.origin : '')



</script>

<template>
  <div class="pb-20">
    <ScrollProgressBar
      :total-events="totalEvents"
      :current-event-index="currentEventIndex"
      :webmention-count="webmentionCount"
    />
    <UContainer>
      <div class="max-w-2xl mx-auto">
        <div class="mb-8 h-card">
          <h1 class="p-name text-3xl font-bold mb-2">Timeline</h1>
          <p class="p-note text-gray-500 dark:text-gray-400">The story of the Odysee, told through the eyes of its actors.</p>
          <a :href="baseUrl" class="u-url hidden" rel="me">OdyFeed</a>
        </div>

        <LoadingCard v-if="isLoading && !timeline" />

        <div v-else-if="timeline?.groupedByEvent && timeline.groupedByEvent.length > 0" class="space-y-8">
          <div
            v-for="group in timeline.groupedByEvent"
            :key="group.event.id"
            :ref="(el) => registerEventElement(group.event.id, el)"
            class="space-y-3"
          >
            <div class="flex items-center gap-3 px-2">
              <div class="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
              <h2 class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{ group.event.title }}
              </h2>
              <div class="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            </div>

            <div v-if="group.posts && group.posts.length > 0">
              <PostList
                  :posts="group.posts"
                  :empty="'No posts yet.'"
              />
            </div>

            <div v-else class="border border-gray-200 dark:border-gray-800 rounded-lg p-8">
              <p class="text-gray-500 dark:text-gray-400 text-center mb-4">{{ group.event.description }}</p>
              <div class="bg-gray-100 dark:bg-gray-900 rounded p-6 space-y-4">
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-5/6"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-4/5"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>

        <EmptyState
          v-else-if="timeline"
          icon="i-heroicons-information-circle"
          title="No posts yet"
          description="The timeline is empty. Check back later!"
        />
      </div>
    </UContainer>
  </div>
</template>