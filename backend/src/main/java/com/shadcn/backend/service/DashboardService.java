package com.shadcn.backend.service;

import com.shadcn.backend.dto.DashboardStatsDTO;
import com.shadcn.backend.dto.DashboardStatsDTO.*;
import com.shadcn.backend.dto.DashboardOverviewDTO;
import com.shadcn.backend.dto.DashboardOverviewDTO.*;
import com.shadcn.backend.repository.*;
import com.shadcn.backend.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final BiografiRepository biografiRepository;
    private final BeritaRepository beritaRepository;
    private final KomentarBeritaRepository komentarBeritaRepository;
    private final UsulanRepository usulanRepository;
    private final DocumentRepository documentRepository;
    private final VoteUsulanRepository voteUsulanRepository;
    private final KomentarUsulanRepository komentarUsulanRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        
        // User login stats
        List<User> monthlyLoggedUsers = userRepository.findUsersLoggedInThisMonth(startOfMonth);
        stats.setMonthlyLoginCount((long) monthlyLoggedUsers.size());        stats.setRecentLogins(monthlyLoggedUsers.stream()
            .limit(5)
            .map(user -> new UserInfoDTO(
                user.getFullName(),
                user.getEmail(),
                user.getUpdatedAt() != null ? user.getUpdatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "Never",
                user.getAvatarUrl() != null ? user.getAvatarUrl() : "/images/default-profile.jpg"
            ))
            .collect(Collectors.toList()));
        
        // Biography stats
        stats.setTotalBiographies(biografiRepository.count());
        List<Biografi> recentBiographies = biografiRepository.findTop5ByOrderByCreatedAtDesc();
        stats.setRecentBiographies(recentBiographies.stream()
            .map(bio -> new UserInfoDTO(
                bio.getNamaLengkap(),
                bio.getEmail(),
                bio.getCreatedAt() != null ? bio.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "Unknown",
                "/images/default-profile.jpg"
            ))
            .collect(Collectors.toList()));
          // News stats
        List<Berita> monthlyNews = beritaRepository.findByCreatedAtAfter(startOfMonth);
        stats.setMonthlyNewsCount((long) monthlyNews.size());
        List<Berita> popularNews = beritaRepository.findTop3PopularThisMonth(startOfMonth);
        stats.setPopularNews(popularNews.stream()
            .limit(3)
            .map(berita -> new BeritaStatsDTO(
                berita.getId(),
                berita.getJudul(),
                berita.getPenulis() != null ? berita.getPenulis() : "Admin",
                berita.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                berita.getJumlahView() != null ? berita.getJumlahView() : 0L,
                komentarBeritaRepository.countByBeritaId(berita.getId()),
                berita.getGambarUrl()
            ))
            .collect(Collectors.toList()));// Popular proposals that are still being voted
        List<Usulan> popularProposals = usulanRepository.findPopularActiveProposals();
        stats.setPopularProposals(popularProposals.stream()
            .limit(3)
            .map(usulan -> {
                // Count votes for this usulan
                long voteCount = voteUsulanRepository.findAll().stream()
                    .filter(vote -> vote.getUsulan().getId().equals(usulan.getId()))
                    .count();
                
                return new UsulanStatsDTO(
                    usulan.getId(),
                    usulan.getJudul(),
                    usulan.getRencanaKegiatan() != null && usulan.getRencanaKegiatan().length() > 100 ? 
                        usulan.getRencanaKegiatan().substring(0, 100) + "..." : 
                        (usulan.getRencanaKegiatan() != null ? usulan.getRencanaKegiatan() : ""),
                    usulan.getNamaPengusul(),
                    usulan.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                    voteCount,
                    usulan.getStatus().toString()
                );
            })
            .collect(Collectors.toList()));
        
        // Recent comments from all types
        List<RecentCommentDTO> recentComments = getRecentComments();
        stats.setRecentComments(recentComments);        // Document stats
        List<Document> monthlyDocuments = documentRepository.findByCreatedAtAfter(startOfMonth);
        stats.setMonthlyDocumentCount((long) monthlyDocuments.size());
        List<Document> popularDocuments = documentRepository.findTop3PopularThisMonth(startOfMonth);
        stats.setPopularDocuments(popularDocuments.stream()
            .limit(3)
            .map(doc -> new DocumentStatsDTO(
                doc.getId(),
                doc.getTitle(),
                doc.getSummary() != null ? doc.getSummary() : "No description available",
                doc.getAuthor(),
                doc.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                doc.getDownloadCount() != null ? doc.getDownloadCount().longValue() : 0L,
                0L, // No comments system for documents yet
                doc.getFileType()
            ))
            .collect(Collectors.toList()));
        
        return stats;
    }

    public DashboardOverviewDTO getDashboardOverview() {
        DashboardOverviewDTO overview = new DashboardOverviewDTO();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime lastMonth = startOfMonth.minusMonths(1);
        
        // Organization Info
        OrganizationInfoDTO orgInfo = new OrganizationInfoDTO();
        orgInfo.setName("IDAU - Ikatan Dokter Alumni Unsoed");
        orgInfo.setDescription("Organisasi yang menghimpun para alumni Fakultas Kedokteran Universitas Jenderal Soedirman untuk mempererat silaturahmi dan mengembangkan profesi kedokteran.");
        orgInfo.setMission("Memfasilitasi networking, pengembangan profesional, dan kontribusi sosial para alumni dokter Unsoed untuk kemajuan dunia kesehatan Indonesia.");
        orgInfo.setVision("Menjadi wadah terdepan bagi alumni dokter Unsoed dalam mengembangkan karir dan memberikan kontribusi nyata bagi masyarakat.");
        orgInfo.setEstablishedYear("2015");
        orgInfo.setLogoUrl("/logo.svg");
        overview.setOrganizationInfo(orgInfo);
        
        // Quick Stats
        QuickStatsDTO quickStats = new QuickStatsDTO();
        quickStats.setTotalMembers(biografiRepository.count());
        quickStats.setActiveMembers(userRepository.countActiveUsers(startOfMonth));
        quickStats.setTotalNews(beritaRepository.count());
        quickStats.setTotalProposals(usulanRepository.count());
        quickStats.setTotalDocuments(documentRepository.count());
        quickStats.setMonthlyLogins(userRepository.countLoginsThisMonth(startOfMonth));
        
        // Calculate growth rates
        long currentMonthMembers = biografiRepository.countByCreatedAtAfter(startOfMonth);
        long lastMonthMembers = biografiRepository.countByCreatedAtBetween(lastMonth, startOfMonth);
        double memberGrowth = lastMonthMembers > 0 ? 
            ((double) (currentMonthMembers - lastMonthMembers) / lastMonthMembers) * 100 : 0;
        quickStats.setMemberGrowthRate(memberGrowth);
        
        long currentMonthNews = beritaRepository.countByCreatedAtAfter(startOfMonth);
        long lastMonthNews = beritaRepository.countByCreatedAtBetween(lastMonth, startOfMonth);
        double newsGrowth = lastMonthNews > 0 ? 
            ((double) (currentMonthNews - lastMonthNews) / lastMonthNews) * 100 : 0;
        quickStats.setNewsGrowthRate(newsGrowth);
        
        overview.setQuickStats(quickStats);
        
        // Monthly Data for charts (last 6 months)
        List<MonthlyDataDTO> monthlyData = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime monthEnd = monthStart.plusMonths(1);
            
            MonthlyDataDTO monthData = new MonthlyDataDTO();
            monthData.setMonth(monthStart.format(DateTimeFormatter.ofPattern("MMM yyyy")));
            monthData.setLogins(userRepository.countLoginsBetween(monthStart, monthEnd));
            monthData.setNewMembers(biografiRepository.countByCreatedAtBetween(monthStart, monthEnd));
            monthData.setNewsPublished(beritaRepository.countByCreatedAtBetween(monthStart, monthEnd));
            monthData.setProposalsSubmitted(usulanRepository.countByCreatedAtBetween(monthStart, monthEnd));
            monthData.setDocumentsUploaded(documentRepository.countByCreatedAtBetween(monthStart, monthEnd));
            
            monthlyData.add(monthData);
        }
        overview.setMonthlyData(monthlyData);
        
        // Activity Feed
        List<ActivityFeedDTO> activityFeed = new ArrayList<>();        // Recent logins
        List<User> recentLogins = userRepository.findTop5ByOrderByUpdatedAtDesc();
        recentLogins.forEach(user -> {
            ActivityFeedDTO activity = new ActivityFeedDTO();
            activity.setType("login");
            activity.setTitle("User Login");
            activity.setDescription(user.getFullName() + " telah login ke sistem");
            activity.setUserName(user.getFullName());
            activity.setUserAvatar(user.getAvatarUrl() != null ? user.getAvatarUrl() : "/images/default-profile.jpg");
            activity.setTimestamp(user.getUpdatedAt() != null ? 
                user.getUpdatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "");
              // If user has a biography, link to biography page
            Biografi userBiografi = user.getBiografi();
            
            // If biography is not directly linked, try to find it by name or email as fallback
            if (userBiografi == null) {
                userBiografi = biografiRepository.findByNamaLengkap(user.getFullName()).orElse(null);
                if (userBiografi == null) {
                    userBiografi = biografiRepository.findByEmail(user.getEmail()).orElse(null);
                }
            }
            
            if (userBiografi != null) {
                activity.setItemUrl("/biografi/" + userBiografi.getBiografiId());
            } else {
                activity.setItemUrl("/biografi-not-found");
            }
            
            activity.setIcon("User");
            activity.setColor("blue");
            activityFeed.add(activity);
        });
        
        // Recent biographies
        List<Biografi> recentBios = biografiRepository.findTop5ByOrderByCreatedAtDesc();
        recentBios.forEach(bio -> {
            ActivityFeedDTO activity = new ActivityFeedDTO();
            activity.setType("registration");
            activity.setTitle("Pendaftaran Baru");
            activity.setDescription(bio.getNamaLengkap() + " telah mendaftar sebagai anggota");
            activity.setUserName(bio.getNamaLengkap());
            activity.setUserAvatar("/images/default-profile.jpg");
            activity.setTimestamp(bio.getCreatedAt() != null ? 
                bio.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "");
            activity.setItemUrl("/biografi/" + bio.getBiografiId());
            activity.setIcon("UserPlus");
            activity.setColor("green");
            activityFeed.add(activity);
        });
        
        // Recent news
        List<Berita> recentNews = beritaRepository.findTop5ByOrderByCreatedAtDesc();
        recentNews.forEach(berita -> {
            ActivityFeedDTO activity = new ActivityFeedDTO();
            activity.setType("news");
            activity.setTitle("Berita Baru");
            activity.setDescription("Berita '" + berita.getJudul() + "' telah dipublikasikan");
            activity.setUserName(berita.getPenulis() != null ? berita.getPenulis() : "Admin");
            activity.setUserAvatar("/images/default-profile.jpg");
            activity.setTimestamp(berita.getCreatedAt() != null ? 
                berita.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "");
            activity.setItemUrl("/berita/" + berita.getId());
            activity.setIcon("Newspaper");
            activity.setColor("purple");
            activityFeed.add(activity);
        });
        
        // Recent proposals
        List<Usulan> recentProposals = usulanRepository.findTop5ByOrderByCreatedAtDesc();
        recentProposals.forEach(usulan -> {
            ActivityFeedDTO activity = new ActivityFeedDTO();
            activity.setType("proposal");
            activity.setTitle("Usulan Baru");
            activity.setDescription("Usulan '" + usulan.getJudul() + "' telah diajukan");
            activity.setUserName(usulan.getNamaPengusul());
            activity.setUserAvatar("/images/default-profile.jpg");
            activity.setTimestamp(usulan.getCreatedAt() != null ? 
                usulan.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : "");
            activity.setItemUrl("/usulan/" + usulan.getId());
            activity.setIcon("FileText");
            activity.setColor("orange");
            activityFeed.add(activity);
        });
        
        // Sort activity feed by timestamp (most recent first)
        activityFeed.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        overview.setActivityFeed(activityFeed.stream().limit(20).collect(Collectors.toList()));
        
        return overview;
    }
      
    private List<RecentCommentDTO> getRecentComments() {
        List<RecentCommentDTO> comments = new java.util.ArrayList<>();
            // Get recent news comments
        List<KomentarBerita> newsComments = komentarBeritaRepository.findTop5ByOrderByTanggalKomentarDesc();
        newsComments.forEach(comment -> {
            comments.add(new RecentCommentDTO(
                comment.getNamaPengguna(),
                comment.getKonten() != null ? 
                    (comment.getKonten().length() > 100 ? comment.getKonten().substring(0, 100) + "..." : comment.getKonten()) : "",
                comment.getTanggalKomentar().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                "berita",
                comment.getBerita().getJudul(),
                comment.getBerita().getId()
            ));
        });        // Get recent proposal comments
        List<KomentarUsulan> proposalComments = komentarUsulanRepository.findTop5ByOrderByTanggalKomentarDesc();
        proposalComments.forEach(comment -> {
            comments.add(new RecentCommentDTO(
                comment.getNamaPengguna(),
                comment.getKonten() != null ? 
                    (comment.getKonten().length() > 100 ? comment.getKonten().substring(0, 100) + "..." : comment.getKonten()) : "",
                comment.getTanggalKomentar().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")),
                "usulan",
                comment.getUsulan().getJudul(),
                comment.getUsulan().getId()
            ));
        });
        
        // Sort all comments by date and take top 10
        return comments.stream()
            .sorted((c1, c2) -> c2.getCommentDate().compareTo(c1.getCommentDate()))
            .limit(10)
            .collect(Collectors.toList());
    }
}
