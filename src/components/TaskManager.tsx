import { useState, useMemo, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  IconButton,
  useTheme,
  Chip,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Snackbar,
  Alert,
  Drawer,
  Divider,
  ListItemIcon,
  ListItemButton,
  Badge,
  Tooltip,
  Collapse,
  IconButton as MuiIconButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CategoryIcon from "@mui/icons-material/Category";
import StarIcon from "@mui/icons-material/Star";
import TodayIcon from "@mui/icons-material/Today";
import { format, isBefore, startOfToday } from "date-fns";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  category: string;
  priority: "High" | "Medium" | "Low";
  dueDate: Date | null;
  description: string;
  expanded: boolean;
}

interface TaskManagerProps {
  isDarkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
}

const categories = ["Personal", "Work", "Shopping", "Health", "Other"];
const STORAGE_KEY = "task-manager-tasks";

const DRAWER_WIDTH = 240;

const TaskManager = ({ isDarkMode, onThemeChange }: TaskManagerProps) => {
  const theme = useTheme();
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    return savedTasks ? JSON.parse(savedTasks) : [];
  });
  const [currentTask, setCurrentTask] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<
    "High" | "Medium" | "Low"
  >("Medium");
  const [selectedDueDate, setSelectedDueDate] = useState<Date | null>(null);
  const [taskDescription, setTaskDescription] = useState("");
  const [sortBy, setSortBy] = useState<"priority" | "dueDate">("priority");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const showSuccessMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
  };

  const handleAddTask = () => {
    if (currentTask.trim()) {
      const newTask: Task = {
        id: Date.now(),
        text: currentTask.trim(),
        completed: false,
        category: selectedCategory === "All" ? "Other" : selectedCategory,
        priority: selectedPriority,
        dueDate: selectedDueDate,
        description: taskDescription,
        expanded: false,
      };
      setTasks([...tasks, newTask]);
      setCurrentTask("");
      setTaskDescription("");
      setSelectedDueDate(null);
      showSuccessMessage("Task added successfully!");
    }
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    showSuccessMessage("Task deleted successfully!");
  };

  const handleToggleComplete = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    showSuccessMessage("Task status updated!");
  };

  const handleToggleExpand = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, expanded: !task.expanded } : task
      )
    );
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleAddTask();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return theme.palette.error.main;
      case "Medium":
        return theme.palette.warning.main;
      case "Low":
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const isTaskOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false;
    return isBefore(dueDate, startOfToday());
  };

  const getTaskCounts = () => {
    return {
      total: tasks.length,
      completed: tasks.filter((task) => task.completed).length,
      overdue: tasks.filter(
        (task) => task.dueDate && isTaskOverdue(task.dueDate)
      ).length,
      highPriority: tasks.filter(
        (task) => task.priority === "High" && !task.completed
      ).length,
    };
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      const matchesSearch = task.text
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || task.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { High: 0, Medium: 1, Low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
    });
  }, [tasks, searchQuery, selectedCategory, sortBy]);

  const drawer = (
    <Box sx={{ overflow: "auto" }}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Task Manager
        </Typography>
        <IconButton
          onClick={() => onThemeChange(!isDarkMode)}
          sx={{ color: theme.palette.primary.main }}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedCategory === "All"}
            onClick={() => setSelectedCategory("All")}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="All Tasks" />
            <Badge badgeContent={getTaskCounts().total} color="primary" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedCategory === "High Priority"}
            onClick={() => setSelectedCategory("High Priority")}
          >
            <ListItemIcon>
              <StarIcon />
            </ListItemIcon>
            <ListItemText primary="High Priority" />
            <Badge badgeContent={getTaskCounts().highPriority} color="error" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedCategory === "Due Today"}
            onClick={() => setSelectedCategory("Due Today")}
          >
            <ListItemIcon>
              <TodayIcon />
            </ListItemIcon>
            <ListItemText primary="Due Today" />
            <Badge badgeContent={getTaskCounts().overdue} color="warning" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem>
          <Typography variant="subtitle2" color="text.secondary">
            Categories
          </Typography>
        </ListItem>
        {categories.map((category) => (
          <ListItem key={category} disablePadding>
            <ListItemButton
              selected={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              <ListItemIcon>
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText primary={category} />
              <Badge
                badgeContent={
                  tasks.filter((t) => t.category === category).length
                }
                color="primary"
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: theme.palette.background.default,
        }}
      >
        <Box
          component="nav"
          sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <IconButton
              color="primary"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h4" sx={{ flex: 1 }}>
              {selectedCategory === "All" ? "All Tasks" : selectedCategory}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                icon={<CheckCircleIcon />}
                label={`${getTaskCounts().completed}/${
                  getTaskCounts().total
                } Completed`}
                color="success"
                variant="outlined"
              />
              {getTaskCounts().overdue > 0 && (
                <Chip
                  icon={<PriorityHighIcon />}
                  label={`${getTaskCounts().overdue} Overdue`}
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="What needs to be done?"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  onKeyPress={handleKeyPress}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddTask}
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                >
                  Add
                </Button>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedCategory}
                    label="Category"
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <MenuItem value="All">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={selectedPriority}
                    label="Priority"
                    onChange={(e) =>
                      setSelectedPriority(
                        e.target.value as "High" | "Medium" | "Low"
                      )
                    }
                  >
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                </FormControl>

                <DatePicker
                  label="Due Date"
                  value={selectedDueDate}
                  onChange={(newValue: Date | null) =>
                    setSelectedDueDate(newValue)
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                />
              </Box>

              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Add description..."
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                size="small"
              />

              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Sort by:
                </Typography>
                <ToggleButtonGroup
                  value={sortBy}
                  exclusive
                  onChange={(
                    _e: React.MouseEvent<HTMLElement>,
                    value: "priority" | "dueDate"
                  ) => value && setSortBy(value)}
                  size="small"
                >
                  <ToggleButton value="priority">
                    <Tooltip title="Sort by Priority">
                      <PriorityHighIcon />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="dueDate">
                    <Tooltip title="Sort by Due Date">
                      <CalendarTodayIcon />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={3}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              backgroundColor: theme.palette.background.paper,
              flex: 1,
            }}
          >
            <List sx={{ p: 0 }}>
              {filteredAndSortedTasks.map((task) => (
                <ListItem
                  key={task.id}
                  divider
                  sx={{
                    px: 3,
                    py: 2,
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteTask(task.id)}
                      sx={{
                        color: theme.palette.error.main,
                        "&:hover": {
                          backgroundColor: theme.palette.error.light,
                          color: theme.palette.error.contrastText,
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <Checkbox
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id)}
                    icon={<CheckCircleOutlineIcon />}
                    checkedIcon={<CheckCircleIcon />}
                    sx={{
                      color: theme.palette.primary.main,
                      "&.Mui-checked": {
                        color: theme.palette.success.main,
                      },
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            sx={{
                              fontSize: "1.1rem",
                              fontWeight: 500,
                              textDecoration: task.completed
                                ? "line-through"
                                : "none",
                              color: task.completed
                                ? theme.palette.text.secondary
                                : theme.palette.text.primary,
                            }}
                          >
                            {task.text}
                          </Typography>
                          <Chip
                            label={task.priority}
                            size="small"
                            sx={{
                              backgroundColor: getPriorityColor(task.priority),
                              color: theme.palette.common.white,
                            }}
                          />
                          {task.dueDate && (
                            <Chip
                              icon={<CalendarTodayIcon />}
                              label={format(task.dueDate, "MMM d, yyyy")}
                              size="small"
                              color={
                                isTaskOverdue(task.dueDate)
                                  ? "error"
                                  : "default"
                              }
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            gap: 1,
                            alignItems: "center",
                          }}
                        >
                          <Chip
                            label={task.category}
                            size="small"
                            sx={{
                              backgroundColor: theme.palette.primary.light,

                              color: theme.palette.primary.contrastText,
                            }}
                          />
                          {task.description && (
                            <MuiIconButton
                              size="small"
                              onClick={() => handleToggleExpand(task.id)}
                              sx={{ ml: 3 }}
                            >
                              {task.expanded ? (
                                <ExpandLessIcon />
                              ) : (
                                <ExpandMoreIcon />
                              )}
                            </MuiIconButton>
                          )}
                        </Box>
                      }
                    />
                    <Collapse in={task.expanded}>
                      <Box sx={{ mt: 1, pl: 4 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ whiteSpace: "pre-wrap" }}
                        >
                          {task.description}
                        </Typography>
                      </Box>
                    </Collapse>
                  </Box>
                </ListItem>
              ))}
              {filteredAndSortedTasks.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary={
                      tasks.length === 0
                        ? "No tasks yet. Add one above!"
                        : "No tasks match your filters"
                    }
                    sx={{
                      textAlign: "center",
                      color: theme.palette.text.secondary,
                      py: 4,
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Box>

        <Snackbar
          open={showNotification}
          autoHideDuration={3000}
          onClose={() => setShowNotification(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowNotification(false)}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {notificationMessage}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default TaskManager;
