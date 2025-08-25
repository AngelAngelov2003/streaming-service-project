import React, { useEffect, useMemo, useRef, useState } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { FaHeart, FaRegHeart, FaThumbsDown, FaRegThumbsDown, FaRegListAlt, FaList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../AuthContext";
import { useSearch } from "../SearchContext/SearchContext.jsx";

const ContentRow = ({ title, category, type }) => {
    const [items, setItems] = useState([]);
    const [userList, setUserList] = useState([]);
    const [userLikes, setUserLikes] = useState({});
    const [rowHovered, setRowHovered] = useState(false);
    const { currentUser } = useAuth();
    const { searchQuery = "" } = useSearch() || {};
    const navigate = useNavigate();
    const rowRef = useRef(null);

    useEffect(() => {
        const fetchItems = async () => {
            const snap = await getDocs(collection(db, "moviesAndSeries"));
            const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            const filteredByType = type ? all.filter(i => i.type === type) : all;
            setItems(filteredByType);
        };

        const fetchUserData = async () => {
            if (!currentUser) return;
            const listSnap = await getDocs(query(collection(db, "userLists"), where("userId", "==", currentUser.uid)));
            setUserList(listSnap.docs.map(d => d.data().movieId));

            const likesSnap = await getDocs(query(collection(db, "userLikes"), where("userId", "==", currentUser.uid)));
            const likes = {};
            likesSnap.docs.forEach(d => {
                likes[d.data().movieId] = d.data().liked;
            });
            setUserLikes(likes);
        };

        fetchItems();
        fetchUserData();
    }, [currentUser, type]);

    const slideLeft = () => rowRef.current?.scrollBy({ left: -500, behavior: "smooth" });
    const slideRight = () => rowRef.current?.scrollBy({ left: 500, behavior: "smooth" });

    const normalizedCategory = useMemo(() => {
        if (!category) return null;
        return Array.isArray(category) ? category : [category];
    }, [category]);

    const filteredItems = useMemo(() => {
        const q = (searchQuery || "").toLowerCase();
        return items.filter(item => {
            const itemCats = Array.isArray(item.category) ? item.category : item.category ? [item.category] : [];
            const matchesCategory = normalizedCategory ? itemCats.some(cat => normalizedCategory.includes(cat)) : true;
            const matchesSearch = item.title ? item.title.toLowerCase().includes(q) : true;
            return matchesCategory && matchesSearch;
        });
    }, [items, normalizedCategory, searchQuery]);

    const handleAddToList = async (id) => {
        if (!currentUser) return;
        if (userList.includes(id)) {
            const listQ = query(collection(db, "userLists"), where("userId", "==", currentUser.uid), where("movieId", "==", id));
            const snap = await getDocs(listQ);
            await Promise.all(snap.docs.map(s => deleteDoc(doc(db, "userLists", s.id))));
            setUserList(prev => prev.filter(x => x !== id));
        } else {
            await addDoc(collection(db, "userLists"), { userId: currentUser.uid, movieId: id });
            setUserList(prev => [...prev, id]);
        }
    };

    const handleToggleLike = async (id) => {
        if (!currentUser) return;
        const likeQ = query(collection(db, "userLikes"), where("userId", "==", currentUser.uid), where("movieId", "==", id));
        const snap = await getDocs(likeQ);

        if (!snap.empty) {
            const docId = snap.docs[0].id;
            const current = snap.docs[0].data().liked;
            const next = current === true ? null : true;
            await updateDoc(doc(db, "userLikes", docId), { liked: next });
            setUserLikes(prev => ({ ...prev, [id]: next }));
        } else {
            await addDoc(collection(db, "userLikes"), { userId: currentUser.uid, movieId: id, liked: true });
            setUserLikes(prev => ({ ...prev, [id]: true }));
        }
    };

    const handleToggleDislike = async (id) => {
        if (!currentUser) return;
        const likeQ = query(collection(db, "userLikes"), where("userId", "==", currentUser.uid), where("movieId", "==", id));
        const snap = await getDocs(likeQ);

        if (!snap.empty) {
            const docId = snap.docs[0].id;
            const current = snap.docs[0].data().liked;
            const next = current === false ? null : false;
            await updateDoc(doc(db, "userLikes", docId), { liked: next });
            setUserLikes(prev => ({ ...prev, [id]: next }));
        } else {
            await addDoc(collection(db, "userLikes"), { userId: currentUser.uid, movieId: id, liked: false });
            setUserLikes(prev => ({ ...prev, [id]: false }));
        }
    };

    if (!filteredItems.length) return null;

    return (
        <section className="mb-12 relative">
            <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>

            <div
                className="relative"
                onMouseEnter={() => setRowHovered(true)}
                onMouseLeave={() => setRowHovered(false)}
            >
                {rowHovered && (
                    <>
                        <MdChevronLeft
                            onClick={slideLeft}
                            className="absolute top-1/2 left-0 -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 cursor-pointer z-20"
                        />
                        <MdChevronRight
                            onClick={slideRight}
                            className="absolute top-1/2 right-0 -translate-y-1/2 bg-black/50 text-white rounded-full w-10 h-10 cursor-pointer z-20"
                        />
                    </>
                )}

                <div ref={rowRef} className="flex space-x-2 overflow-x-auto hide-scrollbar scroll-smooth py-2">
                    {filteredItems.map(item => (
                        <div
                            key={item.id}
                            className="relative w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] flex-shrink-0 cursor-pointer group"
                        >
                            <div
                                className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video transform transition-all duration-300 ease-in-out hover:scale-110 hover:z-50 hover:shadow-2xl"
                                onClick={() => navigate(`/details/${item.id}`)}
                            >
                                <img
                                    src={item.thumbnailUrl || "https://via.placeholder.com/300x200.png?text=No+Thumbnail"}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-3 space-y-2 transition-opacity duration-300">
                                    <div className="flex justify-between text-2xl">
                                        <span
                                            onClick={e => { e.stopPropagation(); handleAddToList(item.id); }}
                                            className="cursor-pointer"
                                        >
                                            {userList.includes(item.id) ? (
                                                <FaList className="text-red-600" />
                                            ) : (
                                                <FaRegListAlt className="text-white" />
                                            )}
                                        </span>
                                        <span
                                            onClick={e => { e.stopPropagation(); handleToggleLike(item.id); }}
                                            className="cursor-pointer"
                                        >
                                            {userLikes[item.id] === true ? (
                                                <FaHeart className="text-red-600" />
                                            ) : (
                                                <FaRegHeart className="text-white" />
                                            )}
                                        </span>
                                        <span
                                            onClick={e => { e.stopPropagation(); handleToggleDislike(item.id); }}
                                            className="cursor-pointer"
                                        >
                                            {userLikes[item.id] === false ? (
                                                <FaThumbsDown className="text-red-600" />
                                            ) : (
                                                <FaRegThumbsDown className="text-white" />
                                            )}
                                        </span>
                                    </div>
                                    <h3 className="text-white font-semibold text-sm">{item.title}</h3>
                                    {item.type && (
                                        <p className="text-gray-300 text-xs">{String(item.type).toUpperCase()}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ContentRow;