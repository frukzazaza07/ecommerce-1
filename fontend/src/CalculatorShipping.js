import { useRef, useState, useEffect, useCallback, createRef, Component } from "react";
import { useSelector, useDispatch } from 'react-redux';
import GoogleMapReact from 'google-map-react';

const AnyReactComponent = ({ text }) => <div>{text}</div>;
export default function CalculatorShipping(){
    const defaultProps = {
                            center: {
                                lat: 59.95,
                                lng: 30.33
                            },
                            zoom: 11,
                            apiKey: "AIzaSyDYamzk4nmUSKi47j-I7AZ4wi8Tcst611I"
                        };
    const handleApiLoaded = (map, maps) => {
        console.log(map)
        console.log(maps)
        // use map and maps objects
        };

        const SearchBox = ({ maps, onPlacesChanged, placeholder }) => {
            const input = useRef(null);
            const searchBox = useRef(null);
        
            const handleOnPlacesChanged = useCallback(() => {
                if (onPlacesChanged) {
                    onPlacesChanged(searchBox.current.getPlaces());
                }
            }, [onPlacesChanged, searchBox]);
        
            useEffect(() => {
                if (!searchBox.current && maps) {
                    searchBox.current = new maps.places.SearchBox(input.current);
                    searchBox.current.addListener('places_changed', handleOnPlacesChanged);
                }
        
                return () => {
                    if (maps) {
                        searchBox.current = null;
                        maps.event.clearInstanceListeners(searchBox);
                    }
                };
            }, [maps, handleOnPlacesChanged]);
        
            return <input ref={input} placeholder={placeholder} type="text" />;
        };
    return (
        <>
            {/* / Important! Always set the container height explicitly */}
            <div style={{ height: '100vh', width: '100%' }}>
            <GoogleMapReact
  bootstrapURLKeys={{ key: "", libraries: 'places'}}
  defaultCenter={defaultProps.center}
  defaultZoom={defaultProps.zoom}
  yesIWantToUseGoogleMapApiInternals
  onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
>
  <AnyReactComponent
    lat={59.955413}
    lng={30.337844}
    text="My Marker"
  />
</GoogleMapReact>
<SearchBox/>
            </div>
        </>
    )
}