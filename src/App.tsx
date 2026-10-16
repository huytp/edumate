/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { MobileBottomNav, Sidebar } from './components/Sidebar';
import { AuthModal } from './components/modals/AuthModal';
import { AttendanceView } from './components/views/AttendanceView';
import { Circular27CommentsView } from './components/views/Circular27CommentsView';
import { InteractiveGamesView } from './components/views/InteractiveGamesView';
import { OverviewView } from './components/views/OverviewView';
import { ParentChildView } from './components/views/ParentChildView';
import { ParentPortalAndReportsView } from './components/views/ParentPortalAndReportsView';
import { PointsRewardsView } from './components/views/PointsRewardsView';
import { RandomPickerView } from './components/views/RandomPickerView';
import { SemesterResultsView } from './components/views/SemesterResultsView';
import { SettingsView } from './components/views/SettingsView';
import { StudentManagementView } from './components/views/StudentManagementView';
import {
  AppSettings,
  AttendanceRecord,
  DailyComment,
  InteractiveGameItem,
  MusicItem,
  ParentLoginLog,
  ParentMessage,
  PointHistory,
  RewardItem,
  RewardRedemption,
  SemesterResult,
  Student,
  UserRole,
} from './types';
import { Account } from './utils/api';
import { soundManager } from './utils/audio';
import { storageService } from './utils/storage';

interface AppProps {
  account: Account;
  onSignOut: () => void;
}

// Teacher app: the signed-in teacher's classroom.
export default function App({ account, onSignOut }: AppProps) {
  // Authentication & Role
  const [role, setRole] = useState<UserRole>('teacher');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Active navigation tab for Teacher
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Application Data States
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [students, setStudents] = useState<Student[]>(() => storageService.getStudents());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => storageService.getAttendance());
  const [pointsHistory, setPointsHistory] = useState<PointHistory[]>(() => storageService.getPointsHistory());
  const [rewards, setRewards] = useState<RewardItem[]>(() => storageService.getRewards());
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>(() => storageService.getRedemptions());
  const [comments, setComments] = useState<DailyComment[]>(() => storageService.getComments());
  const [semesterResults, setSemesterResults] = useState<SemesterResult[]>(() => storageService.getSemesterResults());
  const [games, setGames] = useState<InteractiveGameItem[]>(() => storageService.getGames());
  const [music, setMusic] = useState<MusicItem[]>(() => storageService.getMusic());
  const [messages, setMessages] = useState<ParentMessage[]>(() => storageService.getMessages());
  const [loginLogs, setLoginLogs] = useState<ParentLoginLog[]>(() => storageService.getLoginLogs());

  // Initialize sound settings with slow, gentle female voice
  useEffect(() => {
    soundManager.setEnabled(
      settings.soundEffectsEnabled,
      settings.speechEnabled,
      settings.speechRate,
      settings.speechPitch ?? 1.30,
      settings.preferredVoiceURI ?? ''
    );
  }, [settings]);

  // Unread messages count
  const unreadMessagesCount = messages.filter((m) => !m.isRead).length;

  // Handlers for state updates and persistence
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  const handleUpdateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    storageService.saveStudents(newStudents);
    // Keep current student in sync if logged in as parent
    if (currentStudent) {
      const match = newStudents.find((s) => s.id === currentStudent.id);
      if (match) setCurrentStudent(match);
    }
  };

  const handleUpdateAttendance = (newAttendance: AttendanceRecord[]) => {
    setAttendance(newAttendance);
    storageService.saveAttendance(newAttendance);
  };

  const handleUpdatePointsHistory = (newHistory: PointHistory[]) => {
    setPointsHistory(newHistory);
    storageService.savePointsHistory(newHistory);
  };

  // These views only pass the new entries, so prepend them instead of replacing the history
  const handleAppendPointsHistory = (newEntries: PointHistory[]) => {
    handleUpdatePointsHistory([...newEntries, ...pointsHistory]);
  };

  const handleUpdateRewards = (newRewards: RewardItem[]) => {
    setRewards(newRewards);
    storageService.saveRewards(newRewards);
  };

  const handleUpdateRedemptions = (newRedemptions: RewardRedemption[]) => {
    setRedemptions(newRedemptions);
    storageService.saveRedemptions(newRedemptions);
  };

  const handleUpdateComments = (newComments: DailyComment[]) => {
    setComments(newComments);
    storageService.saveComments(newComments);
  };

  const handleUpdateSemesterResults = (newResults: SemesterResult[]) => {
    setSemesterResults(newResults);
    storageService.saveSemesterResults(newResults);
  };

  const handleUpdateGames = (newGames: InteractiveGameItem[]) => {
    setGames(newGames);
    storageService.saveGames(newGames);
  };

  const handleUpdateMusic = (newMusic: MusicItem[]) => {
    setMusic(newMusic);
    storageService.saveMusic(newMusic);
  };

  const handleUpdateMessages = (newMessages: ParentMessage[]) => {
    setMessages(newMessages);
    storageService.saveMessages(newMessages);
  };

  // Parent preview (teacher looks at the portal as a parent would)
  const handleLoginAsParent = (student: Student) => {
    setRole('parent');
    setCurrentStudent(student);
  };

  const handleLogout = () => {
    setRole('teacher');
    setCurrentStudent(null);
  };

  // Teacher switches to view as parent for a student
  const handleSwitchToParentView = (student: Student) => {
    storageService.addLoginLog(student);
    setRole('parent');
    setCurrentStudent(student);
    soundManager.playSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        role={role}
        currentStudent={currentStudent}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onSignOut={onSignOut}
        accountName={account.name}
        onUpdateSettings={handleUpdateSettings}
        unreadMessagesCount={unreadMessagesCount}
        onNavigateToTab={(tabId) => {
          setCurrentTab(tabId);
          setIsMobileDrawerOpen(false);
        }}
        onToggleMobileMenu={() => setIsMobileDrawerOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileDrawerOpen}
      />

      {/* Main Body Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar visible in Teacher mode (desktop sidebar + mobile drawer) */}
        {role === 'teacher' && (
          <Sidebar
            currentTab={currentTab}
            onSelectTab={(tabId) => {
              setCurrentTab(tabId);
              setIsMobileDrawerOpen(false);
            }}
            role={role}
            unreadCount={unreadMessagesCount}
            isMobileOpen={isMobileDrawerOpen}
            onCloseMobile={() => setIsMobileDrawerOpen(false)}
          />
        )}

        {/* Content View Container with mobile bottom safe padding */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 lg:p-8 pb-24 md:pb-8">
          {role === 'teacher' ? (
            /* TEACHER ADMIN VIEWS */
            <div>
              {currentTab === 'overview' && (
                <OverviewView
                  students={students}
                  attendance={attendance}
                  pointsHistory={pointsHistory}
                  comments={comments}
                  messages={messages}
                  settings={settings}
                  music={music}
                  onUpdateMusic={handleUpdateMusic}
                  onNavigateToTab={(tabId) => setCurrentTab(tabId)}
                  onOpenQuickRandom={() => setCurrentTab('random_picker')}
                />
              )}

              {currentTab === 'students' && (
                <StudentManagementView
                  students={students}
                  settings={settings}
                  onUpdateStudents={handleUpdateStudents}
                />
              )}

              {currentTab === 'attendance' && (
                <AttendanceView
                  students={students}
                  attendance={attendance}
                  settings={settings}
                  onUpdateAttendance={handleUpdateAttendance}
                />
              )}

              {currentTab === 'points' && (
                <PointsRewardsView
                  students={students}
                  pointsHistory={pointsHistory}
                  rewards={rewards}
                  redemptions={redemptions}
                  settings={settings}
                  onUpdateStudents={handleUpdateStudents}
                  onUpdatePointsHistory={handleUpdatePointsHistory}
                  onUpdateRewards={handleUpdateRewards}
                  onUpdateRedemptions={handleUpdateRedemptions}
                />
              )}

              {currentTab === 'random_picker' && (
                <RandomPickerView
                  students={students}
                  attendance={attendance}
                  settings={settings}
                  onUpdateStudents={handleUpdateStudents}
                  onUpdatePointsHistory={handleAppendPointsHistory}
                />
              )}

              {currentTab === 'comments' && (
                <Circular27CommentsView
                  students={students}
                  comments={comments}
                  settings={settings}
                  onUpdateComments={handleUpdateComments}
                />
              )}

              {currentTab === 'games' && (
                <InteractiveGamesView
                  games={games}
                  students={students}
                  settings={settings}
                  onUpdateGames={handleUpdateGames}
                  onUpdateStudents={handleUpdateStudents}
                  onUpdatePointsHistory={handleAppendPointsHistory}
                />
              )}

              {currentTab === 'semester' && (
                <SemesterResultsView
                  students={students}
                  results={semesterResults}
                  settings={settings}
                  onUpdateResults={handleUpdateSemesterResults}
                />
              )}

              {currentTab === 'parent_portal' && (
                <ParentPortalAndReportsView
                  students={students}
                  messages={messages}
                  loginLogs={loginLogs}
                  settings={settings}
                  onUpdateMessages={handleUpdateMessages}
                  onSwitchToParentView={handleSwitchToParentView}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                />
              )}
            </div>
          ) : (
            /* PARENT VIEW (When logged in as parent for a child) */
            currentStudent && (
              <ParentChildView
                student={currentStudent}
                allAttendance={attendance}
                allComments={comments}
                allResults={semesterResults}
                allMessages={messages}
                allPointsHistory={pointsHistory}
                allRedemptions={redemptions}
                settings={settings}
                onSendMessage={(msg) => handleUpdateMessages([msg, ...messages])}
                onLogout={handleLogout}
              />
            )
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Phone Screens) */}
      {role === 'teacher' && (
        <MobileBottomNav
          currentTab={currentTab}
          onSelectTab={(tabId) => {
            setCurrentTab(tabId);
            setIsMobileDrawerOpen(false);
          }}
          onOpenMoreMenu={() => setIsMobileDrawerOpen(true)}
          unreadCount={unreadMessagesCount}
        />
      )}

      {/* Auth / Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        settings={settings}
        students={students}
        onLoginAsParent={handleLoginAsParent}
      />
    </div>
  );
}
