
import { useState,useEffect } from 'react'
import './App.css'

const initialDestinations = [
  {
    id: 1,
    name: 'Bali',
    country: 'Indonesia',
    category: 'Beach',
    description: 'Discover tropical beaches and beautiful temples.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800'
  },
  {
    id: 2,
    name: 'Paris',
    country: 'France',
    category: 'City',
    description: 'Enjoy art, cafés and iconic architecture.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'
  },
  {
    id: 3,
    name: 'Swiss Alps',
    country: 'Switzerland',
    category: 'Nature',
    description: 'Explore mountain scenery and peaceful lakes.',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800'
    
  }
]

function App() {
  const [search, setSearch] = useState('')
  const [selectedDestination, setSelectedDestination] = useState(null)
  const [myTrip, setMyTrip] = useState(() => {
  try{
    const savedTrip = localStorage.getItem('myTrip')
  return savedTrip ? JSON.parse(savedTrip) : []
  }catch{
    return[]
  }
})
  const [destinations, setDestinations] = useState(initialDestinations)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  useEffect(() => {
  localStorage.setItem('myTrip', JSON.stringify(myTrip))
}, [myTrip])

useEffect(() => {
  async function loadCountryData() {
    try {
      setLoading(true)
      setApiError('')

      const countries = [
        { name: 'Indonesia', code: 'ID' },
        { name: 'France', code: 'FR' },
        { name: 'Switzerland', code: 'CH' }
      ]

      const responses = await Promise.all(
        countries.map((country) =>
          fetch(`https://countries.dev/alpha/${country.code}`)
        )
      )

      if (responses.some((response) => !response.ok)) {
        throw new Error('Could not load country information')
      }

      const countryData = await Promise.all(
        responses.map((response) => response.json())
      )

      setDestinations((currentDestinations) =>
        currentDestinations.map((destination) => {
          const country = countryData.find(
            (item) =>
              item.name.toLowerCase() ===
              destination.country.toLowerCase()
          )

          return {
            ...destination,
            capital: country?.capital || 'Not available',
            region: country?.region || 'Not available',
            flag: country?.flag || ''
          }
        })
      )
    } catch (error) {
      console.error('API fetch failed:', error)
      setApiError(
        'Country information could not be loaded. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  loadCountryData()
}, [])



function addToTrip(destination) {
  const alreadyAdded = myTrip.some(
    (item) => item.id === destination.id
  )

  if (alreadyAdded) return

  setMyTrip((previousTrip) => [...previousTrip, destination])
}

function removeFromTrip(id) {
  setMyTrip((previousTrip) =>
    previousTrip.filter((item) => item.id !== id)
  )
}

  const filteredDestinations = destinations.filter((destination) =>
    destination.name.toLowerCase().includes(search.toLowerCase()) ||
    destination.country.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <header>
        <h1>TripWise</h1>
        <p>Your next adventure starts here.</p>
      </header>

      <main>
        <section className="explore-heading">
          <p className="eyebrow">FIND YOUR NEXT ADVENTURE</p>
          <h2>Explore destinations</h2>
          <p>Discover places for your next trip.</p>

          <input
            className="search-input"
            type="text"
            placeholder="Search destinations or countries..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search destinations"
          />
        </section>
        {loading && <p>Loading destination information...</p>}

{apiError && (
  <p role="alert">
    {apiError}
    <button type="button" onClick={() => window.location.reload()}>
      Try again
    </button>
  </p>
)}

        <section
  className="destination-grid"
  style={{ display: loading || apiError ? 'none' : undefined }}
>
          {filteredDestinations.map((destination) => (
            <article className="destination-card" key={destination.id}>
              <img
                src={destination.image}
                alt={destination.name}
              />

              <div className="card-content">
                <span className="category">{destination.category}</span>
                <h3>{destination.name}</h3>
                <p className="country">{destination.country}</p>
                {destination.flag && (
  <p className="country-flag">
    {destination.flag}</p>
)}

{destination.capital && (
  <p>Capital: {destination.capital}</p>
)}

{destination.region && (
  <p>Region: {destination.region}</p>
)}
                <p>{destination.description}</p>
                <button
                  type="button"
                  onClick={() => setSelectedDestination(destination)}
                >
                  Explore destination
                </button>
              </div>
            </article>
          ))}
        </section>

{selectedDestination && (
  <section className="destination-details">
    <button
      type="button"
      onClick={() => setSelectedDestination(null)}
    >
      ← Back to destinations
    </button>

    <h2>{selectedDestination.name}</h2>
    <p>{selectedDestination.country}</p>

    <img
      src={selectedDestination.image}
      alt={selectedDestination.name}
    />

    <p>{selectedDestination.description}</p>
    <p>Category: {selectedDestination.category}</p>
    <button
  type="button"
  onClick={() => addToTrip(selectedDestination)}
>
  Add to My Trip
</button>
  </section>
)}

<section className="my-trip">
  <h2>My Trip</h2>
  <p>{myTrip.length} destination(s) planned</p>

  {myTrip.length === 0 ? (
    <p>Your itinerary is empty. Explore destinations to add one!</p>
  ) : (
    <div className="trip-list">
      {myTrip.map((destination) => (
        <div className="trip-item" key={destination.id}>
          <span>
            {destination.name}, {destination.country}
          </span>

          <button
            type="button"
            onClick={() => removeFromTrip(destination.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  )}
</section>



        {filteredDestinations.length === 0 && (
          <p className="empty-message">
            No destinations found. Try another search.
          </p>
        )}
      </main>
    </div>
  )
}

export default App
