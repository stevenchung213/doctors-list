import React, { Component } from "react";
import BeatLoader from "react-spinners/BeatLoader";
import DoctorsList from "./DoctorsList";
import DoctorProfile from "./DoctorProfile";
import Menu from "./Menu";
import Tooltip from "react-tooltip";

const resource_url =
  "https://api.betterdoctor.com/2016-03-01/doctors?location=ca&user_location=37.773%2C-122.413&skip=0&limit=100&user_key=1540b0816889c1455a1ddb998fe7801f";

class App extends Component {
  constructor() {
    super();

    this.state = {
      view: "homepage",
      open: false,
      completeList: [],
      doctors: [],
      doctor: null,
      isLoading: false,
      url: "",
      search: {
        input: '',
        type: 'Name',
        gender: 'Both'
      },
      active: 'Doctor Search'
    };
  }

  handleInput = e => {
    const inputType = e.target.name;
    let copy = [...this.state.completeList];
    let currState = { ...this.state.search };

    currState[inputType] = e.target.value;
    this.setState({ search: currState }, () => {

      console.log(this.state.search)
      const { search: { input, type, gender } } = this.state;

      if (input[0] && type === 'Name' && gender === 'Both') {
        copy = copy.filter(doc => doc.profile.first_name.toLowerCase().slice(0, input.length) === input.toLowerCase()
        );
      }

      if (input[0] && type === 'Name' && gender !== 'Both') {
        copy = copy.filter(doc => doc.profile.first_name.toLowerCase().slice(0, input.length) === input.toLowerCase() && doc.profile.gender.toLowerCase() === gender.toLowerCase()
        );
      }

      if (input[0] && type === 'Specialty' && gender === 'Both') {
        copy = copy.filter(doc => doc.specialties.find(specialty => specialty.name.toLowerCase().slice(0, input.length) === input.toLowerCase()
          )
        );
        console.log(copy)
      }

      if (input[0] && type === 'Specialty' && gender !== 'Both') {
        copy = copy.filter(doc => doc.specialties.find(specialty => specialty.name.toLowerCase().slice(0, input.length) === input.toLowerCase()
          ) && doc.profile.gender.toLowerCase() === gender.toLowerCase()
        );
      }

      if (input) {
        this.setState({
          doctors: copy
        })
      } else {
        this.setState({
          doctors: [...this.state.completeList]
        })
      }
    });
  };

  onOpenModal = index => {
    const selectedDoctor = this.state.doctors[index];
    this.setState(
      {
        doctor: selectedDoctor,
        open: true
      },
      () => Tooltip.rebuild()
    );
  };

  onCloseModal = () => {
    this.setState({ open: false }, () => console.log(this.state.open, "STATE ON CLOSE"));
  };

  fetchData = (url) => {
    fetch(url)
      .then(data => data.json())
      .then(data => {
        console.log(data);
        const filtered = data.data.filter(
          doc =>
            !doc.profile.image_url.includes("general_doctor_male") &&
            !doc.profile.image_url.includes("general_doctor_female") &&
            doc.profile.hasOwnProperty('gender')
        );
        const completeList = [...filtered];
        this.setState({ doctors: filtered, completeList, isLoading: false });
      })
      .catch(err => console.log(err));
  };

  componentDidMount() {
    this.setState({ isLoading: true });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(loc => {
        let { latitude, longitude } = loc.coords;
        latitude = latitude.toFixed(3);
        longitude = longitude.toFixed(3);
        console.log(latitude, longitude);
        const userLocationUrl = `https://api.betterdoctor.com/2016-03-01/doctors?location=ca&user_location=${latitude}%2C${longitude}&skip=0&limit=100&user_key=1540b0816889c1455a1ddb998fe7801f`;
        this.setState({
          url: userLocationUrl
        }, () => {
          this.fetchData(this.state.url);
        })
      });
    } else {
      this.fetchData(resource_url);
    }

  }

  render() {
    // console.log(this.state)
    return (
      <div id="root-container">
        <div id="sidebar-container">
          <Menu active={this.state.active}/>
        </div>
        {
          this.state.isLoading &&
          <div className="loader">
            <BeatLoader sizeUnit={"px"}
                        size={50}
                        color={"#123abc"}
                        loading={this.state.isLoading}
            />
          </div>
        }
        {/* only renders Loading component if isLoading is true */}
        {/*className main will only load if isLoading is false */}
        {
          !this.state.isLoading &&
          <div className="main">
            <DoctorsList doctors={this.state.doctors}
                         completeList={this.state.completeList}
                         onClick={this.onOpenModal}
                         onClose={this.onCloseModal}
                         handleInput={this.handleInput}
                         search={this.state.search}
            />
            {
              this.state.open &&
              <DoctorProfile open={this.state.open}
                             onClose={this.onCloseModal}
                             doctors={this.state.doctors}
                             selectedDoctor={this.state.doctor}
              />
            }
          </div>
        }
        {
          this.state.doctor &&
          <div>
            <Tooltip
              id="profile-bio"
              effect="solid"
              globalEventOff="click"
              className="profile-tooltip-click"
            >
              <div className='tooltip-container-bio'>
                {this.state.doctor.profile.bio}
              </div>
            </Tooltip>
            <Tooltip
              id="profile-insurance"
              effect="solid"
              globalEventOff="click"
              className="profile-tooltip-click"
            >
              <div className='tooltip-container-insurance'>
                {
                  this.state.doctor.insurances.map((plan, i) =>
                    <div key={"tooltip-insurance-" + i}>{plan.insurance_plan.name}</div>)
                }
              </div>
            </Tooltip>
          </div>
        }
      </div>
    );
  }
}

export default App;
