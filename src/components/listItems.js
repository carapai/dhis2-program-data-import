import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import DashboardIcon from "@material-ui/icons/Dashboard";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import PeopleIcon from "@material-ui/icons/People";
import BarChartIcon from "@material-ui/icons/BarChart";
import LayersIcon from "@material-ui/icons/Layers";
import SettingsIcon from "@material-ui/icons/Settings";
import { Link } from "react-router-dom";

export const mainListItems = (
  <div>
    <ListItem button component={Link} to="/">
      <ListItemIcon>
        <DashboardIcon/>
      </ListItemIcon>
      <ListItemText primary="Programs"/>
    </ListItem>
      <ListItem button component={Link} to="/aggregates">
        <ListItemIcon>
          <ShoppingCartIcon/>
        </ListItemIcon>
        <ListItemText primary="Aggregates"/>
      </ListItem>
    {/*<ListItem button>
      <ListItemIcon>
        <PeopleIcon/>
      </ListItemIcon>
      <ListItemText primary="Customers"/>
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <BarChartIcon/>
      </ListItemIcon>
      <ListItemText primary="Reports"/>
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <LayersIcon/>
      </ListItemIcon>
      <ListItemText primary="Integrations"/>
    </ListItem>*/}
  </div>
);

export const secondaryListItems = (
  <div>
    <ListSubheader inset>Settings</ListSubheader>
    <ListItem button component={Link} to="/settings">
      <ListItemIcon>
        <SettingsIcon/>
      </ListItemIcon>
      <ListItemText primary="Settings"/>
    </ListItem>
  </div>
);
